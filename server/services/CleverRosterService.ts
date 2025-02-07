import { runInTransaction, TransactionClient } from '../db'
import { Ulid, Uuid } from '../models/pgUtils'
import { TeacherClass, TeacherClassWithStudents } from '../models/Teacher'
import * as CleverAPIService from './CleverAPIService'
import * as FederatedCredentialService from './FederatedCredentialService'
import * as SchoolService from './SchoolService'
import * as StudentService from './StudentService'
import * as SubjectsService from './SubjectsService'
import * as TeacherService from './TeacherService'
import * as UserCreationService from './UserCreationService'

/**
 * Clever Secure Sync Integration (i.e. rostering with Clever).
 *
 * Admins can perform this action through the "Clever Roster" option on the admin
 * console in app.
 *
 * First, we get the district's access token using the district's id and basic auth.
 *
 * With the district access token, we can then get the schools in the district and
 * the students within those schools. Once we have the students belonging to a school,
 * we can upsert the students.
 *
 * Right now, we are really just interested in getting the updated school for students who
 * are using Clever, but there is a lot more data we can pull from Clever that might
 * be useful to integrate with in the future.
 */
export async function rosterDistrict(
  districtId: string,
  cleverToUPchieveIds?: {
    [cleverSchoolId: string]: CleverAPIService.UPchieveSchoolId
  }
) {
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
  } = {
    updatedSchools: {},
    failedSchools: {},
  }

  for (const school of schools) {
    try {
      let upchieveSchool

      const upchieveSchoolId = cleverToUPchieveIds?.[school.id]
      if (upchieveSchoolId) {
        upchieveSchool = await SchoolService.getSchool(upchieveSchoolId)
      } else if (school.nces_id) {
        upchieveSchool = await SchoolService.getSchoolByNcesId(school.nces_id)
      }

      if (!upchieveSchool) {
        let failureReason
        if (upchieveSchoolId) {
          failureReason = `No UPchieve school found with ID of ${upchieveSchoolId}`
        } else if (school.nces_id) {
          failureReason = `No UPchieve school found with nces_id of ${school.nces_id}`
        } else {
          failureReason =
            'Clever school does not contain nces_id and no mapping to UPchieve school provided.'
        }

        upsertReport.failedSchools[school.id] = failureReason
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
          .filter(s => {
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
          .map(s => {
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

        const { created = [], updated = [], failed = [] } =
          upsertReport.updatedSchools[school.id] || {}
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
    } catch (err) {
      upsertReport.failedSchools[school.id] = `Error: ${err}`
      continue
    }
  }

  return upsertReport
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
 * We roster a teacher whenever they sign in with Clever. When they
 * do so, we are able to use their access token to get their classes (called
 * sections in Clever) and all their students.
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
    const teacher = await TeacherService.getTeacherById(teacherId)
    if (!teacher) {
      return
    }

    const cleverStudentIdToUcId = new Map<CleverId, UcId>(
      (
        await Promise.all(
          cleverTeacherStudents.map(async cleverStudent => {
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
    >(cleverClasses.map(cleverClass => [cleverClass.id, cleverClass]))

    const {
      classesToAdd,
      classesToUpdate,
      classesToRemove,
    } = categorizeTeacherClasses(
      cleverClassIdToUcClass,
      cleverClassIdToCleverClass
    )

    // Add all the new classes and students to those classes.
    for (const cleverId of classesToAdd) {
      const cleverClass = cleverClassIdToCleverClass.get(cleverId)
      if (!cleverClass) continue
      const newClass = await addCleverClass(teacherId, cleverClass, tc)

      const ucStudents = cleverClass.students
        .map(cleverStudentId => {
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
      classesToRemove.map(async cleverId => {
        const ucClassId = cleverClassIdToUcClass.get(cleverId)?.id
        if (!ucClassId) return
        return TeacherService.deactivateTeacherClass(ucClassId, tc)
      })
    )

    await TeacherService.updateLastSuccessfulCleverSync(teacherId, tc)
  })
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

// Exported for testing.
export function categorizeTeacherClasses(
  ucClasses: Map<CleverId, TeacherClass>,
  cleverClasses: Map<CleverId, CleverAPIService.TCleverSectionData>
) {
  const ucClassKeys = [...ucClasses.keys()]
  const cleverClassKeys = [...cleverClasses.keys()]

  // The Clever classes that we don't have in our db.
  const classesToAdd = cleverClassKeys.filter(id => !ucClasses.has(id))
  // The Clever classes that exist in both our db and from Clever.
  const classesToUpdate = cleverClassKeys.filter(id => ucClasses.has(id))
  // The Clever classes that are still in our db, but no longer in Clever.
  const classesToRemove = ucClassKeys.filter(id => !cleverClasses.has(id))

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
    .map(cleverId => cleverStudentIdToUcId.get(cleverId))
    .filter((cleverId): cleverId is CleverId => !!cleverId)

  const ucStudentSet = new Set<UcId>(ucStudentsInUcClass)
  const cleverStudentSet = new Set<UcId>(ucStudentsInCleverClass)

  const studentsToAdd = ucStudentsInCleverClass.filter(ucId => {
    return !ucStudentSet.has(ucId)
  })
  const studentsToRemove = ucStudentsInUcClass.filter(ucId => {
    return !cleverStudentSet.has(ucId)
  })

  return { studentsToAdd, studentsToRemove }
}

export function isStudentInValidGrade(grade?: number) {
  return grade && grade > 5 && grade < 13
}
