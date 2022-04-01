import { makeRequired, makeSomeOptional, Ulid } from '../pgUtils'
import { USER_BAN_REASONS } from '../../constants'
import { Reference, Certifications, TrainingCourses, getVolunteerTrainingCourses } from '../Volunteer'
import { Availability } from '../Availability/types'
import { RepoReadError } from '../Errors'
import * as pgQueries from './pg.queries'
import { getClient } from '../../pg'
import _ from 'lodash'
import { getAvailabilityForVolunteer } from '../Availability'
import {
  getCertificationsForVolunteers,
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
  lastActivityAt: Date
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
}

/*
BACKEND (req.user)
_id x
lastActivityAt x
isAdmin x
isOnboarded x
volunterrPartnerOrg x
subjects x
availability x
isVolunteer x
isBanned x
email x
firstname x
certifications x
availabilityLastModifiedAt x
trainingCourses x
isDeactivated x

FRONTEND (state.user.user which is populated by the same method as req.user above)
omit(['references', 'photoIdS3Key', 'photoIdStatus'])
subjects x
_id x
referralCode x
certifications x
trainingCourses x
isVolunteer x
isApproved x
isOnboarded x
firstname x
email x
type x
isBanned x
occupation x
country x
timezone x
availability x
phone x
isDeactivated x
verified x
pastSessions.length x
totalVolunteerHours x
hoursTutored x
elapsedAvailability x
references x
photoIsStatus x
createdAt x
isTestUser x
. (entire user re-emitted to socket on session join and new message)
  - message needs _id and isVolunteer
  - session join needs isVolunteer, isApproved, and _id
*/

export async function getLegacyUserObject(
  userId: Ulid
): Promise<LegacyUserModel> {
  const client = await getClient().connect()
  try {
    const baseResult = await pgQueries.getLegacyUser.run(
      { userId },
      client
    )
    if (!baseResult.length) throw new RepoReadError('Did not find Legacy User object')
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
      'lastActivityAt',
      'referralCode',
      'type'
    ])
    // The frontend still expects ALL possible certification objects on the legacy user
    // So we get all quizzes and map their name to a fresh CertificationInfo object
    const legacyCertificationsResult = await pgQueries.getLegacyCertifications.run(undefined, client)
    const legacyCertifications = legacyCertificationsResult.reduce((agg, v) => {
      const name = makeRequired(v).name
      return {
        ...agg,
        [name]: {
          tries: 0,
          passed: false,
          lastAttemptedAt: undefined
        }
      }
    }, {})
    const volunteerUser: any = {}
    if (baseUser.isVolunteer) {
      // TODO: reuse client
      volunteerUser.availability = await getAvailabilityForVolunteer(userId)
      volunteerUser.references = await getReferencesByVolunteer(userId)
      console.log(`LEGACY REFERENCES: ${JSON.stringify(volunteerUser.references)}`)
      const trainingCourses = await getVolunteerTrainingCourses(userId)
      volunteerUser.trainingCourses = trainingCourses
      volunteerUser.certifications = {
        ...legacyCertifications,
        upchieve101: {
          passed: trainingCourses['upchieve101'].complete,
          tries: 1,
          lastAttemptedAt: trainingCourses['upchieve101'].updatedAt
        },
        ...(await getCertificationsForVolunteers([userId]))[userId]
      }
    }
    const final = _.merge({ _id: baseUser.id }, baseUser, volunteerUser)
    console.log(`LEGACY USER: ${JSON.stringify(final)}`)
    return final as LegacyUserModel
  } catch (err) {
    throw new RepoReadError(err)
  }
}
