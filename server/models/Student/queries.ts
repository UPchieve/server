import {
  getAnalyticsClient,
  getClient,
  getRoClient,
  TransactionClient,
} from '../../db'
import {
  RepoCreateError,
  RepoDeleteError,
  RepoReadError,
  RepoUpdateError,
  RepoUpsertError,
} from '../Errors'
import {
  makeRequired,
  makeSomeRequired,
  makeSomeOptional,
  Ulid,
  Uuid,
} from '../pgUtils'
import * as pgQueries from './pg.queries'
import { USER_BAN_TYPES } from '../../constants'
import {
  CreateStudentProfilePayload,
  Student,
  StudentContactInfo,
  StudentUserProfile,
} from './types'

export type StudentPartnerInfo = {
  id: Ulid
  studentPartnerOrg?: string
  approvedHighschool?: Ulid
}

export async function getStudentPartnerInfoById(
  studentId: Ulid
): Promise<StudentPartnerInfo | undefined> {
  try {
    const result = await pgQueries.getStudentPartnerInfoById.run(
      {
        userId: studentId,
      },
      getClient()
    )
    if (result.length)
      return makeSomeOptional(result[0], [
        'studentPartnerOrg',
        'approvedHighschool',
      ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentContactInfoById(
  studentId: Ulid
): Promise<StudentContactInfo | undefined> {
  try {
    const result = await pgQueries.getStudentContactInfoById.run(
      {
        userId: studentId,
      },
      getClient()
    )
    if (result.length) {
      const ret = makeSomeOptional(result[0], ['schoolId', 'studentPartnerOrg'])
      ret.email = ret.email.toLowerCase()
      return ret
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentByEmail(
  email: string,
  tc: TransactionClient
): Promise<{ id: Ulid } | undefined> {
  try {
    const result = await pgQueries.getStudentByEmail.run(
      {
        email,
      },
      tc
    )
    if (result.length) {
      return makeRequired(result[0])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function isTestUser(
  studentId: Ulid,
  tc: TransactionClient = getClient()
): Promise<boolean> {
  try {
    const result = await pgQueries.isTestUser.run(
      {
        userId: studentId,
      },
      tc
    )
    if (result.length) return makeRequired(result[0]).testUser
    return false
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getTotalFavoriteVolunteers(
  userId: Ulid
): Promise<number> {
  try {
    const result = await pgQueries.getTotalFavoriteVolunteers.run(
      { userId },
      getClient()
    )
    if (result.length) return makeRequired(result[0]).total
    return 0
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function isFavoriteVolunteer(
  studentId: Ulid,
  volunteerId: Ulid
): Promise<boolean> {
  try {
    const result = await pgQueries.isFavoriteVolunteer.run(
      { studentId, volunteerId },
      getClient()
    )
    if (result.length && makeRequired(result[0]).volunteerId) return true
    return false
  } catch (err) {
    throw new RepoReadError(err)
  }
}

type FavoriteVolunteer = {
  volunteerId: Ulid
  firstName: string
  numSessions: number
}

type FavoriteVolunteersResponse = {
  favoriteVolunteers: FavoriteVolunteer[]
  isLastPage: boolean
}

export type UpdateFavoriteVolunteer = {
  studentId: Ulid
  volunteerId: Ulid
}

export async function getFavoriteVolunteersByStudentId(
  studentId: Ulid
): Promise<Ulid[]> {
  try {
    const result = await pgQueries.getFavoriteVolunteersByStudentId.run(
      { studentId },
      getClient()
    )
    return result.map((row) => makeRequired(row).id)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getFavoriteVolunteersPaginated(
  studentId: Ulid,
  limit: number,
  offset: number
): Promise<FavoriteVolunteersResponse> {
  try {
    const result = await pgQueries.getFavoriteVolunteersPaginated.run(
      { studentId, limit, offset },
      getClient()
    )
    return {
      favoriteVolunteers: result.map((row) => makeRequired(row)),
      isLastPage: result.length < limit,
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function deleteFavoriteVolunteer(
  studentId: Ulid,
  volunteerId: Ulid,
  tc?: TransactionClient
): Promise<void> {
  try {
    await pgQueries.deleteFavoriteVolunteer.run(
      { studentId, volunteerId },
      tc ?? getClient()
    )
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}

export async function addFavoriteVolunteer(
  studentId: Ulid,
  volunteerId: Ulid,
  tc?: TransactionClient
): Promise<{ studentId: Ulid; volunteerId: Ulid } | undefined> {
  try {
    const result = await pgQueries.addFavoriteVolunteer.run(
      { studentId, volunteerId },
      tc ?? getClient()
    )
    if (result.length) {
      return makeRequired(result[0])
    }
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getFavoritedVolunteerIdsFromList(
  studentId: Ulid,
  volunteerIds: Ulid[]
) {
  try {
    const result = await pgQueries.getFavoritedVolunteerIdsFromList.run(
      { studentId, volunteerIds },
      getClient()
    )
    return result.map((r) => makeRequired(r).volunteerId)
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function deleteStudent(studentId: Ulid, email: string) {
  try {
    const result = await pgQueries.deleteStudent.run(
      { userId: studentId, email: email.toLowerCase() },
      getClient()
    )
    if (result.length && makeRequired(result[0].ok)) return
    throw new RepoUpdateError('Update query did not delete student')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export type StudentPartnerOrgByKey = {
  partnerId: Ulid
  partnerKey: string
  partnerName: string
  siteId?: string
  siteName?: string
  schoolId?: Ulid
}

export async function getPartnerOrgByKey(
  partnerKey: string | undefined,
  partnerSite: string | undefined,
  client: TransactionClient
): Promise<StudentPartnerOrgByKey | undefined> {
  try {
    const result = await pgQueries.getPartnerOrgByKey.run(
      {
        partnerOrgKey: partnerKey,
        partnerOrgSiteName: partnerSite,
      },
      client
    )
    return result.length
      ? makeSomeOptional(result[0], ['siteId', 'siteName', 'schoolId'])
      : undefined
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type StudentPartnerOrgInstance = {
  name: string
  id: Ulid
  schoolId?: Ulid
  siteName?: string
}

export async function getPartnerOrgsByStudent(
  studentId: Ulid,
  tc: TransactionClient = getRoClient()
) {
  try {
    const activePartnerOrgInstanceResults =
      await pgQueries.getPartnerOrgsByStudent.run({ studentId }, tc)
    const activePartnerOrgInstances = activePartnerOrgInstanceResults.map((v) =>
      makeSomeOptional(v, ['schoolId', 'siteName'])
    )
    return activePartnerOrgInstances
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function deactivateStudentPartnershipInstance(
  studentId: Ulid,
  studentPartnerOrgId: Ulid,
  tc: TransactionClient = getClient()
) {
  try {
    const updateResult =
      await pgQueries.adminDeactivateStudentPartnershipInstance.run(
        { userId: studentId, spoId: studentPartnerOrgId },
        tc
      )
    if (!makeRequired(updateResult[0]).ok)
      throw new Error(
        `Deactivating active partner org instance failed for student ${studentId}`
      )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

/**
 * @legacy Please also update users_schools, which will eventually become the source of truth.
 * @deprecated student_profiles should eventually drop SPO information
 * in favor of users_student_partner_orgs_instances. For now, we write to both
 * when student partnerships are de/activated.
 */
export async function updateStudentProfilePartnerOrg(
  studentId: Ulid,
  partnerOrgId: Ulid | undefined,
  partnerOrgSiteId: Ulid | undefined,
  tc: TransactionClient = getClient()
) {
  try {
    await pgQueries.adminUpdateStudentProfilePartnerOrg.run(
      {
        userId: studentId,
        partnerOrgId,
        partnerOrgSiteId,
      },
      tc
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function activateStudentPartnershipInstance(
  studentId: Ulid,
  newPartnerOrgId: Ulid,
  newPartnerOrgSiteId: Ulid | undefined,
  tc: TransactionClient = getClient()
) {
  try {
    const insertResult = await pgQueries.insertStudentPartnershipInstance.run(
      {
        userId: studentId,
        partnerOrgId: newPartnerOrgId,
        partnerOrgSiteId: newPartnerOrgSiteId,
      },
      tc
    )
    if (!makeRequired(insertResult[0]).ok)
      throw new Error(
        `Inserting partner org ${newPartnerOrgId} instance failed for student ${studentId}`
      )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export type AdminUpdateStudent = {
  firstName: string | undefined
  lastName: string | undefined
  email: string
  studentPartnerOrg: string | undefined
  partnerSite: string | undefined
  isVerified: boolean
  isDeactivated: boolean
  inGatesStudy: boolean | undefined
  partnerSchool: string | undefined
  banType: USER_BAN_TYPES | null
}

export async function adminUpdateStudentUser(
  studentId: Ulid,
  update: {
    email: string
    verified: boolean
    banType: USER_BAN_TYPES | null
    deactivated: boolean
    firstName?: string
    lastName?: string
  },
  tc: TransactionClient = getClient()
) {
  try {
    await pgQueries.adminUpdateStudent.run(
      {
        userId: studentId,
        firstName: update.firstName ?? null,
        lastName: update.lastName ?? null,
        email: update.email.toLowerCase(),
        verified: update.verified,
        banType: update.banType,
        deactivated: update.deactivated,
      },
      tc
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function updateStudentInGatesStudy(
  studentId: Ulid,
  isInStudy: boolean | undefined,
  tc: TransactionClient = getClient()
) {
  try {
    await pgQueries.updateStudentInGatesStudy.run(
      { userId: studentId, inGatesStudy: isInStudy },
      tc
    )
  } catch (err) {
    throw new RepoUpsertError(err)
  }
}

/**
 * @important - When upserting the student's school, be sure to also upsert to users_schools.
 * @deprecated student_profiles.school_id - We will eventually drop this column in favor of users_schools
 */
export async function upsertStudentProfile(
  studentData: CreateStudentProfilePayload,
  tc: TransactionClient
) {
  try {
    const result = await pgQueries.upsertStudentProfile.run(
      {
        userId: studentData.userId,
        college: studentData.college,
        schoolId: studentData.schoolId,
        postalCode: studentData.zipCode,
        gradeLevel: studentData.gradeLevel,
        studentPartnerOrgKey: studentData.studentPartnerOrgKey,
        studentPartnerOrgSiteName: studentData.studentPartnerOrgSiteName,
      },
      tc
    )
    if (!result.length)
      throw new RepoUpsertError('upsertStudentProfile returned 0 rows.')
    return makeSomeRequired(result[0], ['createdAt', 'updatedAt', 'userId'])
  } catch (err) {
    throw new RepoUpsertError(err)
  }
}

export type StudentSessionReportQuery = {
  highSchoolId?: Ulid
  studentPartnerOrg?: string
  studentPartnerSite?: string
  sponsorOrg?: string
  start: Date
  end: Date
}

export type SessionReportRow = {
  sessionId: Ulid
  topic: string
  subject: string
  createdAt: Date
  endedAt: Date
  firstName: string
  lastName: string
  email: string
  partnerSite?: string
  waitTimeMins?: number
  totalMessages: number
  volunteerJoined: string
  volunteerJoinedAt?: Date
  sessionRating?: number
  sponsorOrg?: string
}

// TODO: break out anything that uses RO client into their own repo
export async function getSessionReport(
  query: StudentSessionReportQuery
): Promise<SessionReportRow[] | undefined> {
  try {
    const result = await pgQueries.getSessionReport.run(
      {
        highSchoolId: query.highSchoolId ? query.highSchoolId : undefined,
        studentPartnerOrg: query.studentPartnerOrg
          ? query.studentPartnerOrg
          : undefined,
        studentPartnerSite: query.studentPartnerSite
          ? query.studentPartnerSite
          : undefined,
        sponsorOrg: query.sponsorOrg ? query.sponsorOrg : undefined,
        start: query.start,
        end: query.end,
      },
      getAnalyticsClient()
    )

    if (result.length) {
      return result.map((r) =>
        makeSomeOptional(r, [
          'partnerSite',
          'waitTimeMins',
          'volunteerJoinedAt',
          'sessionRating',
          'sponsorOrg',
        ])
      )
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type StudentUsageReportQuery = {
  highSchoolId?: Ulid
  studentPartnerOrg?: string
  studentPartnerSite?: string
  sponsorOrg?: string
  joinedStart: Date
  joinedEnd: Date
  sessionStart: Date
  sessionEnd: Date
}

export type UsageReportRow = {
  userId: Ulid
  firstName: string
  lastName: string
  email: string
  joinDate: Date
  studentPartnerOrg?: string
  partnerSite?: string
  sponsorOrg?: string
  school?: string
  totalSessions: number
  totalSessionLengthMins: number
  rangeTotalSessions: number
  rangeSessionLengthMins: number
}

// TODO: break out anything that uses RO client into their own repo
export async function getUsageReport(
  query: StudentUsageReportQuery
): Promise<UsageReportRow[] | undefined> {
  try {
    const result = await pgQueries.getUsageReport.run(
      {
        highSchoolId: query.highSchoolId ? query.highSchoolId : undefined,
        studentPartnerOrg: query.studentPartnerOrg
          ? query.studentPartnerOrg
          : undefined,
        studentPartnerSite: query.studentPartnerSite
          ? query.studentPartnerSite
          : undefined,
        sponsorOrg: query.sponsorOrg ? query.sponsorOrg : undefined,
        joinedStart: query.joinedStart,
        joinedEnd: query.joinedEnd,
        sessionStart: query.sessionStart,
        sessionEnd: query.sessionEnd,
      },
      getAnalyticsClient()
    )

    const report = []

    if (result.length) {
      for (const row of result) {
        const session = makeSomeOptional(row, [
          'partnerSite',
          'studentPartnerOrg',
          'school',
          'sponsorOrg',
        ])
        row.email = row.email.toLowerCase()
        report.push({
          ...session,
        })
      }

      return report
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type StudentSignupSources = {
  id: number
  name: string
}

export async function getStudentSignupSources(): Promise<
  StudentSignupSources[] | undefined
> {
  try {
    const result = await pgQueries.getStudentSignupSources.run(
      undefined,
      getClient()
    )
    if (result.length) {
      // query returns sources in a random order, but we want to make sure Other is at the end
      const res = result.map((row) => makeRequired(row))
      const otherIndex = res.findIndex((x) => x.name === 'Other')
      const other = res.splice(otherIndex, 1)[0]
      res.push(other)
      return res
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function deleteSelfFavoritedVolunteers(): Promise<void> {
  try {
    await pgQueries.deleteSelfFavoritedVolunteers.run(undefined, getClient())
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}

export async function getActivePartnersForStudent(
  studentId: Ulid,
  tc?: TransactionClient
): Promise<StudentPartnerOrgInstance[] | undefined> {
  try {
    const result = await pgQueries.getPartnerOrgsByStudent.run(
      { studentId },
      tc ?? getClient()
    )

    if (result.length)
      return result.map((row) =>
        makeSomeOptional(row, ['schoolId', 'siteName'])
      )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentIdsForGradeLevelSgUpdate(): Promise<Ulid[]> {
  try {
    const result = await pgQueries.getStudentsIdsForGradeLevelSgUpdate.run(
      undefined,
      getClient()
    )

    if (result.length) return result.map((row) => makeRequired(row).userId)
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function countDuplicateStudentVolunteerFavorites(): Promise<number> {
  try {
    const result = await pgQueries.countDuplicateStudentVolunteerFavorites.run(
      undefined,
      getClient()
    )
    if (
      result.length &&
      result[0].duplicates !== null &&
      makeRequired(result[0].duplicates)
    ) {
      return result[0].duplicates!
    }
    throw new RepoReadError(
      'Could not count duplicates in student_favorite_volunteer'
    )
  } catch (error) {
    throw new RepoReadError(error)
  }
}

export async function deleteDuplicateStudentVolunteerFavorites(
  tc: TransactionClient
): Promise<number> {
  try {
    const result = await pgQueries.deleteDuplicateStudentVolunteerFavorites.run(
      undefined,
      tc
    )
    if (
      result.length &&
      result[0].deleted !== null &&
      makeRequired(result[0])
    ) {
      return result[0].deleted!
    }

    throw new RepoUpdateError(
      'Could not delete duplicates in student_favorite_volunteers'
    )
  } catch (error) {
    throw new RepoUpdateError(error)
  }
}

export async function getStudentProfileByUserId(
  userId: Ulid
): Promise<Student> {
  const students = await getStudentProfilesByUserIds(getClient(), [userId])
  if (students.length) return students[0] as unknown as Student
  else
    throw new RepoReadError(
      `getStudentProfileByUserId: Could not find student with user id ${userId}`
    )
}

export async function getStudentProfilesByUserIds(
  tc: TransactionClient,
  userIds: Ulid[]
): Promise<StudentUserProfile[]> {
  try {
    if (!userIds.length) return []
    const result = await pgQueries.getStudentProfilesByUserIds.run(
      { userIds },
      tc
    )
    if (result.length) {
      return result.map((r) => makeSomeOptional(r, ['gradeLevel', 'schoolId']))
    }

    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateStudentSchool(
  studentId: Ulid,
  schoolId: Uuid,
  tc: TransactionClient
) {
  try {
    await pgQueries.updateStudentSchool.run(
      {
        userId: studentId,
        schoolId,
      },
      tc
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function addStudentsToTeacherClass(
  studentIds: Ulid[],
  classId: Uuid,
  tc: TransactionClient
) {
  try {
    await pgQueries.addStudentsToTeacherClass.run(
      {
        studentIds,
        classId,
      },
      tc
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getStudentByCleverId(
  cleverStudentId: Ulid,
  tc: TransactionClient = getClient()
): Promise<{ id: Ulid } | undefined> {
  try {
    const result = await pgQueries.getStudentByCleverId.run(
      {
        cleverStudentId,
      },
      tc
    )
    if (result.length) return result[0]
  } catch (err) {
    throw new RepoReadError(err)
  }
}
