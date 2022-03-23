import { makeRequired, makeSomeRequired, Ulid } from '../pgUtils'
import { USER_BAN_REASONS } from '../../constants'
import { Reference, Certifications, TrainingCourses } from '../Volunteer'
import { Availability } from '../Availability/types'
import { RepoReadError } from '../Errors'
import * as pgQueries from './pg.queries'
import { getClient } from '../../pg'
import _ from 'lodash'

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
TODO: still need
    certifications: Certifications

    trainingCourses: TrainingCourses 

    availability: Availability 

    references: Reference[] 

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
  - join need isVolunteer, isApproved, and _id


*/

export async function getLegacyUserObject(userId: Ulid): Promise<LegacyUserModel | undefined> {
  try {
    const baseResult = await pgQueries.getLegacyUser.run({ userId }, getClient())
    if (!baseResult.length) return
    const baseUser = makeSomeRequired(baseResult[0],
      ['banReason', 'phone', 'college', 'referredBy'])
    if (baseUser.isVolunteer) {
      // TODO: get availability, certs, training courses, and references
    }
    const final = _.merge({ _id: baseUser.id }, baseUser)
    return final as LegacyUserModel
  } catch (err) {
    throw new RepoReadError(err)
  }
}
