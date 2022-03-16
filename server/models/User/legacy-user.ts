import { Ulid } from '../pgUtils'
import { USER_BAN_REASON } from '../../constants'
import { Reference, Certifications, TrainingCourses } from '../Volunteer'
import { Availability } from '../Availability/types'
import { RepoReadError } from '../Errors'

export type LegacyUserModel = {
  // pg
  id: Ulid
  firstName: string
  // mongo user
  _id: Ulid
  createdAt: Date
  email: string
  password: string
  verified: boolean
  passwordResetToken?: string
  firstname: string
  phone?: string
  college?: string
  isVolunteer: boolean
  isAdmin: boolean
  isBanned: boolean
  banReason?: USER_BAN_REASON
  isTestUser: boolean
  isFakeUser: boolean
  isDeactivated: boolean
  pastSessions: Ulid[]
  partnerUserId?: string
  lastActivityAt: Date
  referralCode: string
  referredBy?: Ulid
  type: string
  // volunteer
  isOnboarded: boolean
  isApproved: boolean
  volunteerPartnerOrg: string
  subjects: string[]
  availability: Availability
  certifications: Certifications
  availabilityLastModifiedAt: Date
  trainingCourses: TrainingCourses
  occupation: string[]
  country: string
  timezone: string
  totalVolunteerHours: number
  hoursTutored: number
  elapsedAvailability: number
  references: Reference[]
  photoIdStatus: string
}

/*
TODO: still need
    subjects: string[] 
    certifications: Certifications
    trainingCourses: TrainingCourses 

    availability: Availability 
    availabilityLastModifiedAt: Date 

    references: Reference[] 
  
    totalVolunteerHours: number - needs schema change for verizon volunteers profiles
    occupation: string[] - needs schema change to volunteer profiles
    elapsedAvailability: number - needs schema change to track using legacy system
*/

export async function getLegacyUserObject(userId: Ulid): Promise<LegacyUserModel | undefined> {
  try {
    return
  } catch (err) {
    throw new RepoReadError(err)
  }
}