import { getClient, getRoClient } from '../../db'
import {
  RepoCreateError,
  RepoDeleteError,
  RepoReadError,
  RepoTransactionError,
  RepoUpdateError,
} from '../Errors'
import { SingleFeedback } from '../Feedback/queries'
import { ResponseData, StudentCounselingFeedback } from '../Feedback/types'
import {
  getDbUlid,
  makeRequired,
  makeSomeRequired,
  Ulid,
  generateReferralCode,
} from '../pgUtils'
import * as pgQueries from './pg.queries'
import * as FeedbackRepo from '../../models/Feedback/queries'
import { isPgId } from '../../utils/type-utils'

export type ReportedStudent = {
  id: Ulid
  firstName: string
  lastName: string
  email: string
  createdAt: Date
  isTestUser: boolean
  isBanned: boolean
  isDeactivated: boolean
  isVolunteer: boolean
  studentPartnerOrg?: string
}

export async function getReportedStudent(
  studentId: Ulid
): Promise<ReportedStudent | undefined> {
  try {
    const result = await pgQueries.getReportedStudent.run(
      {
        userId: studentId,
      },
      getClient()
    )
    if (result.length) return makeSomeRequired(result[0], ['studentPartnerOrg'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

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
      return makeSomeRequired(result[0], [
        'studentPartnerOrg',
        'approvedHighschool',
      ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type StudentContactInfo = {
  id: Ulid
  firstName: string
  email: string
  studentPartnerOrg?: string
  schoolId?: Ulid
}
export async function getStudentContactInfoById(
  studentId: Ulid
): Promise<StudentContactInfo | undefined> {
  try {
    const result = await pgQueries.getStudentContactInfoById.run(
      {
        userId: isPgId(studentId) ? studentId : undefined,
        mongoUserId: isPgId(studentId) ? undefined : studentId,
      },
      getClient()
    )
    if (result.length)
      return makeSomeRequired(result[0], ['schoolId', 'studentPartnerOrg'])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// NOTE: duplicate of `isTestUser` query function in this file
// TODO: remove once there are no more callers of this function
export async function getTestStudentExistsById(
  studentId: Ulid
): Promise<boolean> {
  try {
    const result = await pgQueries.isTestUser.run(
      {
        userId: studentId,
      },
      getClient()
    )
    if (result.length) return makeRequired(result[0]).testUser
    return false
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function isTestUser(studentId: Ulid): Promise<boolean> {
  try {
    const result = await pgQueries.isTestUser.run(
      {
        userId: studentId,
      },
      getClient()
    )
    if (result.length) return makeRequired(result[0]).testUser
    return false
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type GatesStudent = {
  id: Ulid
  studentPartnerOrg?: string
  currentGrade: string
  isPartnerSchool: boolean
  approvedHighschool: Ulid
}

export async function getGatesStudentById(
  userId: Ulid
): Promise<GatesStudent | undefined> {
  try {
    const result = await pgQueries.getGatesStudentById.run(
      { userId },
      getClient()
    )
    if (result.length) return makeSomeRequired(result[0], ['studentPartnerOrg'])
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
    return result.map(row => makeRequired(row).id)
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
      favoriteVolunteers: result.map(row => makeRequired(row)),
      isLastPage: result.length < limit,
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function deleteFavoriteVolunteer(
  studentId: Ulid,
  volunteerId: Ulid
): Promise<UpdateFavoriteVolunteer> {
  try {
    const result = await pgQueries.deleteFavoriteVolunteer.run(
      { studentId, volunteerId },
      getClient()
    )

    if (result.length) return makeRequired(result[0])
    throw new RepoDeleteError(
      'Delete query did not return deleted favorited volunteer'
    )
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}

export async function addFavoriteVolunteer(
  studentId: Ulid,
  volunteerId: Ulid
): Promise<UpdateFavoriteVolunteer> {
  try {
    const result = await pgQueries.addFavoriteVolunteer.run(
      { studentId, volunteerId },
      getClient()
    )
    if (result.length) return makeRequired(result[0])
    throw new RepoUpdateError(
      'Update query did not return added favorite volunteer'
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function deleteStudent(studentId: Ulid, email: string) {
  try {
    const result = await pgQueries.deleteStudent.run(
      { userId: studentId, email },
      getClient()
    )
    if (result.length && makeRequired(result[0].ok)) return
    throw new RepoUpdateError('Update query did not delete student')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

// if partnerOrg isnt provided then remove partnerOrg entirely
// if parttnerSite isnt provided then remove partnerSite entirely
// if gates study isnt provided then dont touch it
// all other fields override
export type AdminUpdateStudent = {
  firstName: string
  lastName: string
  email: string
  studentPartnerOrg: string | undefined
  partnerSite: string | undefined
  isVerified: boolean
  isBanned: boolean
  isDeactivated: boolean
  inGatesStudy: boolean | undefined
}

export async function adminUpdateStudent(
  studentId: Ulid,
  update: AdminUpdateStudent
) {
  const transactionClient = await getClient().connect()
  try {
    const partnerOrgResult = await pgQueries.getPartnerOrgByKey.run(
      {
        partnerOrgKey: update.studentPartnerOrg,
        partnerOrgSiteName: update.partnerSite,
      },
      getClient()
    )
    const partnerOrg = partnerOrgResult.length
      ? makeRequired(partnerOrgResult[0])
      : undefined
    await transactionClient.query('BEGIN')

    const updateStudentResult = await pgQueries.adminUpdateStudent.run(
      {
        userId: studentId,
        firstName: update.firstName,
        lastName: update.lastName,
        email: update.email,
        verified: update.isVerified,
        banned: update.isBanned,
        deactivated: update.isDeactivated,
      },
      transactionClient
    )
    const updateStudentProfileResult = await pgQueries.adminUpdateStudentProfile.run(
      {
        userId: studentId,
        partnerOrgId: partnerOrg ? partnerOrg.partnerId : undefined,
        partnerOrgSiteId: partnerOrg ? partnerOrg.siteId : undefined,
      },
      transactionClient
    )
    const updateProductFlagsResult = await pgQueries.updateStudentInGatesStudy.run(
      { userId: studentId, inGatesStudy: update.inGatesStudy },
      transactionClient
    )
    if (
      !(
        updateStudentResult.length &&
        updateStudentProfileResult.length &&
        updateProductFlagsResult.length &&
        makeRequired(updateStudentResult[0]).ok &&
        makeRequired(updateStudentProfileResult[0]).ok &&
        makeRequired(updateProductFlagsResult[0]).ok
      )
    )
      throw new RepoUpdateError('Update query did not update the student')
    await transactionClient.query('COMMIT')
  } catch (err) {
    await transactionClient.query('ROLLBACK')
    if (err instanceof RepoUpdateError) throw err
    throw new RepoTransactionError(err)
  } finally {
    transactionClient.release()
  }
}

export type CreateStudentPayload = {
  email: string
  firstName: string
  lastName: string
  password: string
  referredBy: Ulid | undefined
  studentPartnerOrg?: string | undefined
  zipCode: string | undefined
  approvedHighschool: Ulid | undefined
  currentGrade?: string
  partnerSite?: string
  partnerUserId?: string
  college?: string
  signupSourceId?: number
}
export type CreatedStudent = StudentContactInfo & {
  isDeactivated: boolean
  isTestUser: boolean
  createdAt: Date
  isVolunteer: boolean
  isAdmin: boolean
  isBanned: boolean
  verified: boolean
  zipCode: string
  currentGrade: string
  lastname: string
  firstname: string
}

export async function createStudent(
  studentData: CreateStudentPayload
): Promise<CreatedStudent> {
  const transactionClient = await getClient().connect()
  try {
    const userId = getDbUlid()
    await transactionClient.query('BEGIN')
    const userResult = await pgQueries.createStudentUser.run(
      {
        userId,
        referralCode: generateReferralCode(userId),
        email: studentData.email,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        password: studentData.password,
        referredBy: studentData.referredBy,
        signupSourceId: studentData.signupSourceId,
      },
      transactionClient
    )
    const profileResult = await pgQueries.createStudentProfile.run(
      {
        userId,
        college: studentData.college,
        partnerOrg: studentData.studentPartnerOrg,
        partnerSite: studentData.partnerSite,
        postalCode: studentData.zipCode,
        gradeLevel: studentData.currentGrade,
        schoolId: studentData.approvedHighschool,
      },
      transactionClient
    )
    if (userResult.length && profileResult.length) {
      const profile = makeSomeRequired(profileResult[0], [
        'studentPartnerOrg',
        'partnerSite',
        'college',
        'postalCode',
        'gradeLevel',
        'schoolId'
      ])
      const user = makeRequired(userResult[0])

      await transactionClient.query('COMMIT')
      return {
        id: user.id,
        firstname: user.firstName,
        firstName: user.firstName,
        lastname: user.lastName,
        email: user.email,
        isBanned: user.banned,
        isDeactivated: user.deactivated,
        isTestUser: user.testUser,
        isAdmin: false,
        isVolunteer: false,
        verified: user.verified,
        createdAt: user.createdAt,
        currentGrade: profile.gradeLevel,
        zipCode: profile.postalCode,
      }
    }
    throw new RepoCreateError(
      'could not create student, profile or user came back with 0 rows'
    )
  } catch (err) {
    await transactionClient.query('ROLLBACK')
    if (err instanceof RepoCreateError) throw err
    throw new RepoTransactionError(err)
  } finally {
    transactionClient.release()
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

function toObject<T>(obj: unknown): T {
  const thing =
    typeof obj === 'object'
      ? obj
      : typeof obj === 'string'
      ? JSON.parse(obj)
      : obj
  return thing
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
      getRoClient()
    )

    const report = []

    if (result.length) {
      for (const row of result) {
        const feedback = await FeedbackRepo.getFeedbackBySessionIdUserType(
          row.sessionId,
          'student'
        )
        const session = makeSomeRequired(row, [
          'partnerSite',
          'volunteerJoinedAt',
          'sponsorOrg',
          'waitTimeMins',
        ])

        let sessionRating: number | undefined

        if (feedback) {
          const counselingFeedback:
            | StudentCounselingFeedback
            | undefined = toObject(feedback.studentCounselingFeedback)
          const responseData: ResponseData | undefined = toObject(
            feedback.responseData
          )

          sessionRating =
            counselingFeedback?.['rate-session']?.rating ||
            responseData?.['rate-session']?.rating
        }

        report.push({ ...session, sessionRating })
      }

      return report
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
  feedbacks: SingleFeedback[]
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
      getRoClient()
    )

    const report = []

    if (result.length) {
      for (const row of result) {
        const feedbacks = await FeedbackRepo.getFeedbackByUserId(row.userId)
        const session = makeSomeRequired(row, [
          'partnerSite',
          'studentPartnerOrg',
          'school',
          'sponsorOrg',
        ])
        report.push({
          ...session,
          feedbacks: feedbacks?.length ? feedbacks : [],
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

    if (result.length) return result.map(row => makeRequired(row))
  } catch (err) {
    throw new RepoReadError(err)
  }
}
