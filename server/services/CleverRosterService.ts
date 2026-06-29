import { runInTransaction, TransactionClient } from '../db'
import { Ulid, Uuid } from '../models/pgUtils'
import { TeacherClass, TeacherClassWithStudents } from '../models/Teacher'
import * as SchoolRepo from '../models/School'
import * as UserRepo from '../models/User'
import * as CleverAPIService from './CleverAPIService'
import * as FederatedCredentialService from './FederatedCredentialService'
import * as SchoolService from './SchoolService'
import * as StudentService from './StudentService'
import * as SubjectsService from './SubjectsService'
import * as TeacherService from './TeacherService'
import * as UserCreationService from './UserCreationService'

/**
 * Clever Secure Sync rostering, triggered by admins via the "Clever Roster"
 * option in the admin console (POST /clever/roster).
 *
 * With a district access token we pull each school's students and teachers and
 * roster them. Teachers are rostered here, not at SSO login — a teacher signing
 * in via any provider (Clever or ClassLink) matches their already-rostered
 * account by email, which is how ClassLink teachers get classes with no
 * ClassLink-specific code.
 *
 * We use only a fraction of what Clever exposes today; there's a lot more data
 * available that could power future features worth exploring.
 */
export async function rosterDistrict(districtId: string) {
  const accessToken = await CleverAPIService.getDistrictAccessToken(districtId)
  const schools = await CleverAPIService.getSchoolsInDistrict(accessToken)

  const upsertReport: {
    updatedSchools: {
      [cleverSchoolId: string]: {
        upchieveSchoolId: string
        created: unknown[]
        updated: unknown[]
        skipped: unknown[]
        failed: unknown[]
      }
    }
    failedSchools: { [cleverSchoolId: string]: string }
    rosteredTeachers: {
      [cleverSchoolId: string]: {
        rostered: string[]
        failed: { id: string; email?: string; reason: string }[]
      }
    }
  } = {
    updatedSchools: {},
    failedSchools: {},
    rosteredTeachers: {},
  }

  for (const school of schools) {
    try {
      const upchieveSchool = await getUpchieveSchoolFromCleverId(school.id)

      if (!upchieveSchool) {
        upsertReport.failedSchools[school.id] =
          `No mapping provided for Clever school with id ${school.id}.`
        continue
      }

      let cleverStudents = await CleverAPIService.getStudentsInSchool(
        school.id,
        accessToken
      )
      while (cleverStudents.length) {
        const filteredOut: {
          id: string
          email: string
          gradeLevel?: string
          parsedGradeLevel?: number
        }[] = []
        const students = cleverStudents
          .filter((s) => {
            const grade = CleverAPIService.parseCleverGrade(
              s.roles.student.grade
            )
            if (grade && grade > 5 && grade < 13) {
              return true
            }
            filteredOut.push({
              id: s.id,
              email: s.email,
              gradeLevel: s.roles.student.grade,
              parsedGradeLevel: grade,
            })
            return false
          })
          .map((s) => {
            return {
              firstName: s.name.first,
              lastName: s.name.last,
              email: s.email,
              gradeLevel: s.roles.student.grade,
              cleverId: s.id,
            }
          })

        const result = await UserCreationService.rosterPartnerStudents(
          students,
          upchieveSchool.id,
          false
        )

        const {
          created = [],
          updated = [],
          failed = [],
        } = upsertReport.updatedSchools[school.id] || {}
        upsertReport.updatedSchools[school.id] = {
          upchieveSchoolId: upchieveSchool.id,
          created: [...created, ...result.created],
          updated: [...updated, ...result.updated],
          skipped: filteredOut,
          failed: [...failed, ...result.failed],
        }

        const lastStudentCleverId = cleverStudents[cleverStudents.length - 1].id
        cleverStudents = await CleverAPIService.getStudentsInSchool(
          school.id,
          accessToken,
          lastStudentCleverId
        )
      }

      const teacherReport = await rosterSchoolTeachers(
        school.id,
        upchieveSchool.id,
        accessToken
      )
      if (teacherReport.rostered.length || teacherReport.failed.length) {
        upsertReport.rosteredTeachers[school.id] = teacherReport
      }
    } catch (err) {
      upsertReport.failedSchools[school.id] = `Error: ${err}`
      continue
    }
  }

  return upsertReport
}

/**
 * Rosters every teacher in a Clever school (paginated). One teacher failing is
 * recorded and doesn't abort the rest.
 */
async function rosterSchoolTeachers(
  cleverSchoolId: string,
  upchieveSchoolId: Uuid,
  accessToken: string
): Promise<{
  rostered: Ulid[]
  failed: { id: string; email?: string; reason: string }[]
}> {
  const rostered: Ulid[] = []
  const failed: { id: string; email?: string; reason: string }[] = []
  let cleverTeachers = await CleverAPIService.getTeachersInSchool(
    cleverSchoolId,
    accessToken
  )
  while (cleverTeachers.length) {
    for (const cleverTeacher of cleverTeachers) {
      try {
        rostered.push(
          await rosterCleverTeacher(
            cleverTeacher,
            upchieveSchoolId,
            accessToken
          )
        )
      } catch (err) {
        failed.push({
          id: cleverTeacher.id,
          email: cleverTeacher.email,
          reason: `${err}`,
        })
      }
    }
    cleverTeachers = await CleverAPIService.getTeachersInSchool(
      cleverSchoolId,
      accessToken,
      cleverTeachers[cleverTeachers.length - 1].id
    )
  }
  return { rostered, failed }
}

/**
 * Find-or-creates one teacher and syncs their classes. Throws when the teacher
 * can't be resolved (no email, or the email belongs to a non-teacher account).
 */
async function rosterCleverTeacher(
  cleverTeacher: CleverAPIService.TCleverTeacherData,
  upchieveSchoolId: Uuid,
  accessToken: string
): Promise<Ulid> {
  const teacher = await findOrCreateUpchieveTeacher(
    cleverTeacher,
    upchieveSchoolId
  )
  if (!teacher) {
    throw new Error(
      'could not resolve teacher (no email, or email belongs to a non-teacher account)'
    )
  }
  // Account creation and class rostering are deliberately separate
  // transactions: a class-sync failure leaves the created account intact (it
  // re-syncs next run) rather than rolling back a successful signup.
  const [classes, students] = await Promise.all([
    CleverAPIService.getTeacherClasses(cleverTeacher.id, accessToken),
    CleverAPIService.getTeacherStudents(cleverTeacher.id, accessToken),
  ])
  await rosterTeacherClasses(teacher.id, classes, students)
  return teacher.id
}

type CleverId = string
type UcId = Ulid
type UcCleverClass = TeacherClassWithStudents & {
  cleverId: CleverId
}
/**
 * To roster a teacher, we go through all their classes from Clever to see which
 * are new, update the students in whichever are the same, and archive the
 * ones that are no longer in Clever.
 *
 * We roster a teacher during the batch district roster (rosterDistrict), using
 * the district access token to get their classes (called sections in Clever)
 * and all their students.
 *
 * The Clever sections only contain a list of ids of the students in the class,
 * which is why we also fetch all the students, so we have the
 * necessary student data in the event we need to create them.
 */
export async function rosterTeacherClasses(
  teacherId: Ulid,
  cleverClasses: CleverAPIService.TCleverSectionData[],
  cleverTeacherStudents: CleverAPIService.TCleverStudentData[]
) {
  await runInTransaction(async (tc: TransactionClient) => {
    const teacher = await TeacherService.getTeacherById(teacherId, tc)
    if (!teacher) {
      return
    }

    const cleverStudentIdToUcId = new Map<CleverId, UcId>(
      (
        await Promise.all(
          cleverTeacherStudents.map(async (cleverStudent) => {
            const ucStudent = await findOrCreateUpchieveStudent(
              cleverStudent,
              teacher.schoolId,
              tc
            )
            if (!ucStudent) return
            return [cleverStudent.id, ucStudent.id]
          })
        )
      ).filter((s): s is [CleverId, UcId] => !!s)
    )

    const cleverClassIdToUcClass = new Map<CleverId, UcCleverClass>(
      (await TeacherService.getTeacherClasses(teacherId, tc))
        .filter((ucClass): ucClass is UcCleverClass => !!ucClass.cleverId)
        .map((ucClass: UcCleverClass) => [ucClass.cleverId, ucClass])
    )
    const cleverClassIdToCleverClass = new Map<
      CleverId,
      CleverAPIService.TCleverSectionData
    >(cleverClasses.map((cleverClass) => [cleverClass.id, cleverClass]))

    const { classesToAdd, classesToUpdate, classesToRemove } =
      categorizeTeacherClasses(
        cleverClassIdToUcClass,
        cleverClassIdToCleverClass
      )

    // Add all the new classes and students to those classes.
    for (const cleverId of classesToAdd) {
      const cleverClass = cleverClassIdToCleverClass.get(cleverId)
      if (!cleverClass) continue
      const newClass = await addCleverClass(teacherId, cleverClass, tc)

      const ucStudents = cleverClass.students
        .map((cleverStudentId) => {
          return cleverStudentIdToUcId.get(cleverStudentId)
        })
        .filter((s): s is UcId => !!s)
      await TeacherService.addStudentsToTeacherClassById(
        ucStudents,
        newClass.id,
        tc
      )
    }

    // Add or remove students from existing classes.
    for (const cleverId of classesToUpdate) {
      const ucClass = cleverClassIdToUcClass.get(cleverId)
      const cleverClass = cleverClassIdToCleverClass.get(cleverId)
      if (!ucClass || !cleverClass) continue

      const ucStudents = await TeacherService.getStudentIdsInTeacherClass(
        ucClass.id,
        tc
      )
      const { studentsToAdd, studentsToRemove } = categorizeStudentsInClass(
        ucStudents,
        cleverClass.students,
        cleverStudentIdToUcId
      )
      if (studentsToAdd.length) {
        await TeacherService.addStudentsToTeacherClassById(
          studentsToAdd,
          ucClass.id,
          tc
        )
      }
      if (studentsToRemove.length) {
        await TeacherService.removeStudentsFromTeacherClassById(
          studentsToRemove,
          ucClass.id,
          tc
        )
      }
    }

    // Archive any classes that are no longer in Clever.
    await Promise.all(
      classesToRemove.map(async (cleverId) => {
        const ucClassId = cleverClassIdToUcClass.get(cleverId)?.id
        if (!ucClassId) return
        return TeacherService.deactivateTeacherClass(ucClassId, tc)
      })
    )

    await TeacherService.updateLastSuccessfulCleverSync(teacherId, tc)
  })
}

export async function addCleverSchoolMapping(
  cleverSchoolId: string,
  upchieveSchoolId: Uuid
) {
  return SchoolRepo.addCleverSchoolMapping(cleverSchoolId, upchieveSchoolId)
}

export async function getUpchieveSchoolIdFromCleverId(cleverSchoolId: string) {
  return SchoolRepo.getUpchieveSchoolIdFromCleverId(cleverSchoolId)
}

async function getUpchieveSchoolFromCleverId(cleverSchoolId: string) {
  const ucSchoolId = await getUpchieveSchoolIdFromCleverId(cleverSchoolId)
  if (ucSchoolId) {
    return SchoolService.getSchool(ucSchoolId)
  }
}

// Exported for testing.
export async function findOrCreateUpchieveStudent(
  cleverStudent: CleverAPIService.TCleverStudentData,
  schoolId: Uuid | undefined,
  tc: TransactionClient
) {
  if (
    !isStudentInValidGrade(
      CleverAPIService.parseCleverGrade(cleverStudent.roles.student.grade)
    )
  )
    return

  let student = await StudentService.getStudentByCleverId(cleverStudent.id, tc)
  if (student) {
    return student
  }

  if (!cleverStudent.email) {
    return
  }

  student = await StudentService.getStudentByEmail(cleverStudent.email, tc)
  if (student) {
    await FederatedCredentialService.linkAccount(
      cleverStudent.id,
      FederatedCredentialService.Issuer.CLEVER,
      student.id,
      tc
    )
    return student
  }
  const data = {
    email: cleverStudent.email,
    firstName: cleverStudent.name.first,
    issuer: FederatedCredentialService.Issuer.CLEVER,
    lastName: cleverStudent.name.last,
    profileId: cleverStudent.id,
    schoolId: schoolId,
  }
  return UserCreationService.registerStudent(data, tc)
}

/**
 * Resolves the UPchieve teacher by fed cred, then by email, else creates a new
 * one. Mirrors {@link findOrCreateUpchieveStudent}.
 */
export async function findOrCreateUpchieveTeacher(
  cleverTeacher: CleverAPIService.TCleverTeacherData,
  schoolId: Uuid | undefined
): Promise<{ id: Ulid } | undefined> {
  const existingFedCred = await FederatedCredentialService.getFedCredForUser(
    cleverTeacher.id,
    FederatedCredentialService.Issuer.CLEVER
  )
  if (existingFedCred?.userId) {
    return { id: existingFedCred.userId }
  }

  if (!cleverTeacher.email) {
    return
  }

  const existingUser = await UserRepo.getUserIdByEmail(cleverTeacher.email)
  if (existingUser) {
    // Only link to an account that is already a teacher; attaching a teacher's
    // Clever id to a student/volunteer who shares the email would be wrong.
    // TODO(future): consider adding the teacher role to the existing account
    // instead, to support one person being both a teacher and a student.
    const teacher = await TeacherService.getTeacherById(existingUser.id)
    if (!teacher) {
      return
    }
    await FederatedCredentialService.linkAccount(
      cleverTeacher.id,
      FederatedCredentialService.Issuer.CLEVER,
      existingUser.id
    )
    return { id: existingUser.id }
  }

  const newTeacher = await UserCreationService.rosterTeacher({
    email: cleverTeacher.email,
    firstName: cleverTeacher.name.first,
    issuer: FederatedCredentialService.Issuer.CLEVER,
    lastName: cleverTeacher.name.last,
    profileId: cleverTeacher.id,
    schoolId,
  })
  return { id: newTeacher.id }
}

// Exported for testing.
export function categorizeTeacherClasses(
  ucClasses: Map<CleverId, TeacherClass>,
  cleverClasses: Map<CleverId, CleverAPIService.TCleverSectionData>
) {
  const ucClassKeys = [...ucClasses.keys()]
  const cleverClassKeys = [...cleverClasses.keys()]

  // The Clever classes that we don't have in our db.
  const classesToAdd = cleverClassKeys.filter((id) => !ucClasses.has(id))
  // The Clever classes that exist in both our db and from Clever.
  const classesToUpdate = cleverClassKeys.filter((id) => ucClasses.has(id))
  // The Clever classes that are still in our db, but no longer in Clever.
  const classesToRemove = ucClassKeys.filter((id) => !cleverClasses.has(id))

  return { classesToAdd, classesToUpdate, classesToRemove }
}

async function addCleverClass(
  teacherId: Ulid,
  cleverClass: CleverAPIService.TCleverSectionData,
  tc: TransactionClient
) {
  const topicName = CleverAPIService.getTopicFromCleverSubject(
    cleverClass.subject
  )
  const topicId = await SubjectsService.getTopicIdFromName(topicName, tc)
  return TeacherService.createTeacherClass(
    teacherId,
    cleverClass.name,
    topicId,
    cleverClass.id,
    tc
  )
}

// Exported for testing.
export function categorizeStudentsInClass(
  ucStudentsInUcClass: UcId[],
  cleverStudentsInCleverClass: CleverId[],
  cleverStudentIdToUcId: Map<CleverId, UcId>
) {
  const ucStudentsInCleverClass = cleverStudentsInCleverClass
    .map((cleverId) => cleverStudentIdToUcId.get(cleverId))
    .filter((cleverId): cleverId is CleverId => !!cleverId)

  const ucStudentSet = new Set<UcId>(ucStudentsInUcClass)
  const cleverStudentSet = new Set<UcId>(ucStudentsInCleverClass)

  const studentsToAdd = ucStudentsInCleverClass.filter((ucId) => {
    return !ucStudentSet.has(ucId)
  })
  const studentsToRemove = ucStudentsInUcClass.filter((ucId) => {
    return !cleverStudentSet.has(ucId)
  })

  return { studentsToAdd, studentsToRemove }
}

export function isStudentInValidGrade(grade?: number) {
  return grade && grade > 5 && grade < 13
}
