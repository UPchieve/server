import { GRADES } from '../../constants'
import { Ulid, Uuid } from '../pgUtils'

export type Student = {
  userId: Ulid
  college?: string
  schoolId?: Ulid
  postalCode?: string
  gradeLevel?: string
  studentPartnerOrgUserId?: string
  studentPartnerOrgId?: Ulid
  studentPartnerOrgSiteId?: Ulid
  createdAt: Date
  updatedAt: Date
}

export type CreateStudentPayload = {
  email: string
  firstName: string
  lastName: string
  password?: string | undefined
  referredBy: Ulid | undefined
  studentPartnerOrg?: string | undefined
  zipCode?: string | undefined
  approvedHighschool: Ulid | undefined
  currentGrade?: string
  partnerSite?: string
  partnerUserId?: string
  college?: string
  signupSourceId?: number
  otherSignupSource?: string
  verified?: boolean
  emailVerified?: boolean
}

export type CreateStudentWithPasswordPayload = CreateStudentPayload & {
  password: string
}
export type CreateStudentWithFedCredPayload = CreateStudentPayload & {
  password?: string | undefined
  verified: boolean
  emailVerified: boolean
}

export type CreatedStudent = StudentContactInfo & {
  isDeactivated: boolean
  isTestUser: boolean
  createdAt: Date
  isVolunteer: boolean
  isAdmin: boolean
  isBanned: boolean
  verified: boolean
  zipCode?: string
  currentGrade?: string
  lastname: string
  firstname: string
}

export type StudentContactInfo = {
  id: Ulid
  firstName: string
  email: string
  studentPartnerOrg?: string
  schoolId?: Ulid
}

export type CreateStudentProfilePayload = {
  college?: string
  gradeLevel?: string
  partnerSite?: string
  schoolId?: Ulid
  studentPartnerOrg?: string
  userId: Ulid
  zipCode?: string
}

export type CreateStudentProfileResult = {
  college?: string
  createdAt: Date
  gradeLevel?: GRADES
  partnerSite?: string
  partnerUserId?: string
  postalCode?: string
  schoolId?: Uuid
  studentPartnerOrg?: string
  updatedAt: Date
  userId: Ulid
}
