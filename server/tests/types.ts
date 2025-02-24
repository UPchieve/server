import { GRADES } from '../constants'
import { Ulid } from '../models/pgUtils'
import { User, UserRole } from '../models/User'
import { RoleContext } from '../services/UserRolesService'

export interface RegistrationForm {
  firstName: string
  lastName: string
  email: string
  password: string
  partnerUserId?: string
  terms: boolean
}

export interface StudentRegistrationForm extends RegistrationForm {
  zipCode: string
  referredByCode?: string
  studentPartnerOrg?: string
  partnerSite?: string
  highSchoolId: string
  college?: string
}

export interface VolunteerRegistrationForm extends RegistrationForm {
  phone: string
  volunteerPartnerOrg?: string
}

// TODO: Use actual type definitions.
export type AppUser = {
  firstname: string
  lastname: string
  isDeactivated: boolean
  isTestUser: boolean
  isAdmin: boolean
  isVolunteer: boolean
  /** @deprecated Use {@link roleContext} instead */
  roles: UserRole[]
  roleContext: RoleContext
} & User

export type AppStudent = {
  zipCode: string
  schoolId: Ulid
  currentGrade: GRADES
  signupSourceId: number
  studentPartnerOrg: string
  studentPartnerSite: string
  partnerUserId: string
  college: string
} & AppUser

export type AppVolunteer = {
  volunteerPartnerOrg: string
  phone: string
} & AppUser
