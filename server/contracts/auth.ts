import type { Uuid } from '../types/shared'
import type {
  SponsorOrgPublic,
  StudentPartnerOrgPublic,
  VolunteerPartnerOrgPublic,
} from './partner-orgs'
import type {
  LegacyUserPublic,
  NewUserPublic,
  NewVolunteerPublic,
} from './users'

export type AuthStatusResponse = {
  authenticated: boolean
  isAdmin?: boolean
  totpVerified?: boolean
}

export type LogoutResponse = {
  msg: 'You have been logged out!'
}

export type LoginResponse = {
  user: LegacyUserPublic
}

export type CheckCredentialResponse = {
  checked: boolean
}

export type NewUserResponse = {
  user: NewUserPublic
}

export type ExistingUserResponse = {
  user: { id: Uuid }
}

export type NewVolunteerResponse = {
  user: NewVolunteerPublic
}

export type VolunteerPartnerOrgResponse = {
  volunteerPartner: VolunteerPartnerOrgPublic
}

export type StudentPartnerOrgResponse = {
  studentPartner: StudentPartnerOrgPublic
}

export type StudentPartnerOrgManuallyApprovedResponse = {
  studentPartner: StudentPartnerOrgPublic & {
    isManuallyApproved: boolean
  }
}

export type StudentPartnerOrgKeyResponse = {
  studentPartnerKey: string
}

export type StudentPartnerOrgsResponse = {
  partnerOrgs: StudentPartnerOrgPublic[]
}

export type VolunteerPartnerOrgsResponse = {
  partnerOrgs: VolunteerPartnerOrgPublic[]
}

export type SponsorOrgsResponse = {
  sponsorOrgs: SponsorOrgPublic[]
}

export type ResetPasswordResponse = {
  msg: 'If an account with this email address exists then we will send a password reset email'
}
