import { makeRequired, makeSomeRequired, Ulid } from '../pgUtils'
import { GRADES, USER_BAN_REASONS, USER_BAN_TYPES } from '../../constants'
import {
  Certifications,
  getActiveQuizzesForVolunteers,
  getCertificationsForVolunteer,
  getVolunteerTrainingCourses,
  Reference,
  Sponsorship,
  TrainingCourses,
} from '../Volunteer'
import { Availability } from '../Availability/types'
import { RepoReadError } from '../Errors'
import * as pgQueries from './pg.queries'
import { getClient } from '../../db'
import _ from 'lodash'
import { getAvailabilityForVolunteer } from '../Availability'
import {
  getQuizzesForVolunteers,
  getReferencesByVolunteer,
} from '../Volunteer/queries'
import { getUserSessionStats, UserSessionStats } from '../Session'
import { getUsersLatestSubjectsByUserId } from './'
import * as UserRolesService from '../../services/UserRolesService'
import * as SurveyService from '../../services/SurveyService'
import { PostsessionSurveyRatingsMetric } from '../../services/SurveyService'
import { UserRole } from './types'
import * as AssignmentsService from '../../services/AssignmentsService'
import { StudentAssignment } from '../Assignments/types'
import { RoleContext } from '../../services/UserRolesService'

export type LegacyUserModel = {
  // pg
  id: Ulid
  firstName: string
  // mongo user
  _id: Ulid
  createdAt: Date
  email: string
  proxyEmail?: string
  verified: boolean
  firstname: string
  phone?: string
  college?: string
  /** @deprecated */
  isVolunteer: boolean
  /** @deprecated */
  userType: UserRole
  /** @deprecated */
  isAdmin: boolean
  //leaving isBanned only to make this backwards-compatible with mobile
  isBanned: boolean
  banType?: USER_BAN_TYPES
  banReason?: USER_BAN_REASONS
  roleContext: RoleContext
  isTestUser: boolean
  isFakeUser: boolean
  isDeactivated: boolean
  pastSessions: Ulid[]
  lastActivityAt?: Date
  referralCode: string
  referredBy?: Ulid
  sessionStats: UserSessionStats
  // volunteer
  isOnboarded?: boolean
  isApproved?: boolean
  volunteerPartnerOrg?: string
  subjects?: string[]
  activeSubjects?: string[]
  mutedSubjectAlerts?: string[]
  totalActiveCertifications?: number
  availability?: Availability
  certifications?: Certifications
  availabilityLastModifiedAt?: Date
  trainingCourses?: TrainingCourses
  occupation?: string[]
  country?: string
  timezone?: string
  totalVolunteerHours?: number
  hoursTutored?: number
  elapsedAvailability?: number
  references?: Reference[]
  photoIdStatus?: string
  // student
  gradeLevel?: GRADES
  schoolName?: string
  latestRequestedSubjects?: string[]
  numberOfStudentClasses?: number
  issuers?: string[]
  studentPartnerOrg?: string
  isSchoolPartner?: boolean
  usesClever?: boolean
  usesGoogle?: boolean
  studentAssignments?: StudentAssignment[]
  ratings?: PostsessionSurveyRatingsMetric
  // teacher
  lastSuccessfulCleverSync?: Date

  // sponsor
  sponsorships?: Sponsorship[]
}

// TODO: Actually make this legacy and clean this up.
export async function getLegacyUserObject(
  userId: Ulid
): Promise<LegacyUserModel> {
  const client = await getClient().connect()
  try {
    const baseResult = await pgQueries.getLegacyUser.run({ userId }, client)
    if (!baseResult.length)
      throw new RepoReadError('Did not find Legacy User object')
    const baseUser = makeSomeRequired(baseResult[0], [
      'id',
      'firstName',
      'firstname',
      'createdAt',
      'email',
      'verified',
      'isAdmin',
      'isVolunteer',
      'isTestUser',
      'isDeactivated',
      'referralCode',
    ])
    // manually parse out incoming bigint to number
    baseUser.hoursTutored =
      baseUser.hoursTutored || Number(baseUser.hoursTutored)
    // The frontend still expects ALL possible certification objects on the legacy user
    // So we get all quizzes and map their name to a fresh QuizInfo object
    const legacyCertificationsResult =
      await pgQueries.getLegacyCertifications.run(undefined, client)
    const legacyCertifications = legacyCertificationsResult.reduce((agg, v) => {
      const name = makeRequired(v).name
      return {
        ...agg,
        [name]: {
          tries: 0,
          passed: false,
          lastAttemptedAt: undefined,
        },
      }
    }, {})
    const sessionStats = await getUserSessionStats(userId)
    const volunteerUser: any = {}
    const studentUser: any = {}
    const teacherUser: { usesClever?: boolean } = {}
    const roleContext = await UserRolesService.getRoleContext(userId)
    const ratings =
      await SurveyService.getUserPostsessionGoalRatingsMetrics(userId)
    if (roleContext.isActiveRole('student')) {
      studentUser.latestRequestedSubjects =
        await getUsersLatestSubjectsByUserId(baseUser.id)
      studentUser.usesGoogle =
        baseUser.issuers?.some((issuer) => issuer.includes('google')) ?? false
      studentUser.usesClever =
        baseUser.issuers?.some((issuer) => issuer.includes('clever')) ?? false
      delete baseUser.issuers
      studentUser.studentAssignments =
        await AssignmentsService.getAssignmentsByStudentId(baseUser.id)
    }
    if (roleContext.isActiveRole('volunteer')) {
      if (!baseUser.subjects) baseUser.subjects = []
      if (!baseUser.activeSubjects) baseUser.activeSubjects = []
      if (!baseUser.mutedSubjectAlerts) baseUser.mutedSubjectAlerts = []
      volunteerUser.availability = await getAvailabilityForVolunteer(
        userId,
        client
      )
      const references = await getReferencesByVolunteer(userId, client)
      volunteerUser.references = references.map((ref) => ({
        ...ref,
        _id: ref.id,
        status: ref.status.toUpperCase(),
      }))
      baseUser.photoIdStatus = baseUser.photoIdStatus?.toUpperCase()
      const trainingCourses = await getVolunteerTrainingCourses(userId, client)
      if (!trainingCourses['upchieve101']) {
        trainingCourses['upchieve101'] = {
          userId: baseUser.id,
          trainingCourse: 'upchieve101',
          complete: false,
          isComplete: false,
          completedMaterials: [],
          progress: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }
      // TODO: ask if we want to allow users to take quizzes in subjects they already unlocked
      volunteerUser.trainingCourses = trainingCourses
      volunteerUser.certifications = {
        // legacyCertifications is a map of all of the quizzes defined via the `quizzes` table
        ...legacyCertifications,
        ...(await getQuizzesForVolunteers([userId], client))[userId],
        ...(await getCertificationsForVolunteer([userId], client))[userId],
      }
      const totalActiveCerts = Object.keys(
        (await getActiveQuizzesForVolunteers([userId], client))[userId]
      ).length
      volunteerUser.totalActiveCertifications = totalActiveCerts
    }
    if (roleContext.isActiveRole('teacher')) {
      teacherUser.usesClever =
        baseUser.issuers?.some((issuer) => issuer.includes('clever')) ?? false
    }
    const final = _.merge(
      {
        _id: baseUser.id,
        userType: roleContext.activeRole,
        roles: roleContext.roles,
      },
      baseUser,
      volunteerUser,
      studentUser,
      teacherUser,
      { isBanned: baseUser.banType === 'complete' },
      {
        sessionStats,
      },
      { ratings },
      { roleContext }
    )
    return final as LegacyUserModel
  } catch (err) {
    throw new RepoReadError(err)
  } finally {
    client.release()
  }
}
