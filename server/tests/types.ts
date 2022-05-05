import { GRADES } from '../constants'
import { Ulid } from '../models/pgUtils'
import { User } from '../models/User'

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

export type AppUser = {
  firstname: string
  lastname: string
  isBanned: boolean
  isDeactivated: boolean
  isTestUser: boolean
  isAdmin: boolean
  isVolunteer: boolean
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
