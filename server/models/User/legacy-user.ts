import { makeRequired, makeSomeOptional, Ulid } from '../pgUtils'
import { GRADES, USER_BAN_REASONS } from '../../constants'
import {
  Reference,
  Certifications,
  TrainingCourses,
  getVolunteerTrainingCourses,
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

export type LegacyUserModel = {
  // pg
  id: Ulid
  firstName: string
  // mongo user
  _id: Ulid
  createdAt: Date
  email: string
  verified: boolean
  firstname: string
  phone?: string
  college?: string
  isVolunteer: boolean
  isAdmin: boolean
  isBanned: boolean
  banReason?: USER_BAN_REASONS
  isTestUser: boolean
  isFakeUser: boolean
  isDeactivated: boolean
  pastSessions: Ulid[]
  lastActivityAt?: Date
  referralCode: string
  referredBy?: Ulid
  type: string
  // volunteer
  isOnboarded?: boolean
  isApproved?: boolean
  volunteerPartnerOrg?: string
  subjects?: string[]
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
  gradeLevel: GRADES
  schoolName: string
}

export async function getLegacyUserObject(
  userId: Ulid
): Promise<LegacyUserModel> {
  const client = await getClient().connect()
  try {
    const baseResult = await pgQueries.getLegacyUser.run({ userId }, client)
    if (!baseResult.length)
      throw new RepoReadError('Did not find Legacy User object')
    const baseUser = makeSomeOptional(baseResult[0], [
      'id',
      'firstName',
      'firstname',
      'createdAt',
      'email',
      'verified',
      'isAdmin',
      'isVolunteer',
      'isTestUser',
      'isBanned',
      'isDeactivated',
      'referralCode',
      'type',
    ])
    // manually parse out incoming bigint to number
    baseUser.hoursTutored =
      baseUser.hoursTutored || Number(baseUser.hoursTutored)
    // The frontend still expects ALL possible certification objects on the legacy user
    // So we get all quizzes and map their name to a fresh QuizInfo object
    const legacyCertificationsResult = await pgQueries.getLegacyCertifications.run(
      undefined,
      client
    )
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
    const volunteerUser: any = {}
    if (baseUser.isVolunteer) {
      if (!baseUser.subjects) baseUser.subjects = []
      volunteerUser.availability = await getAvailabilityForVolunteer(
        userId,
        client
      )
      const references = await getReferencesByVolunteer(userId, client)
      volunteerUser.references = references.map(ref => ({
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
      volunteerUser.trainingCourses = trainingCourses
      volunteerUser.certifications = {
        // legacyCertifications is a map of all of the quizzes defined via the `quizzes` table
        ...legacyCertifications,
        ...(await getQuizzesForVolunteers([userId], client))[userId],
      }
    }
    const final = _.merge({ _id: baseUser.id }, baseUser, volunteerUser)
    return final as LegacyUserModel
  } catch (err) {
    throw new RepoReadError(err)
  } finally {
    client.release()
  }
}
