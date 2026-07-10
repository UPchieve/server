import type {
  NewUserPublic,
  NewVolunteerPublic,
  VolunteerContactInfoPublic,
} from '../contracts/users'
import type {
  CreatedVolunteer,
  VolunteerContactInfo,
} from '../models/Volunteer'

export function toNewUserPublic(student: NewUserPublic): NewUserPublic {
  return {
    id: student.id,
    firstName: student.firstName,
    email: student.email,
    userType: student.userType,
    isAdmin: student.isAdmin,
    proxyEmail: student.proxyEmail,
  }
}

export function toVolunteerContactInfoPublic(
  volunteer: VolunteerContactInfo
): VolunteerContactInfoPublic {
  return {
    id: volunteer.id,
    email: volunteer.email,
    phone: volunteer.phone,
    firstName: volunteer.firstName,
    lastName: volunteer.lastName,
    volunteerPartnerOrg: volunteer.volunteerPartnerOrg,
    approved: volunteer.approved,
  }
}

export function toNewVolunteerPublic(
  volunteer: CreatedVolunteer
): NewVolunteerPublic {
  return {
    ...toVolunteerContactInfoPublic(volunteer),
    deactivated: volunteer.deactivated,
    testUser: volunteer.testUser,
    createdAt: volunteer.createdAt.toISOString(),
    isAdmin: volunteer.isAdmin,
    smsConsent: volunteer.smsConsent,
    userType: volunteer.userType,
    banType: volunteer.banType,
    signupSourceId: volunteer.signupSourceId,
    otherSignupSource: volunteer.otherSignupSource,
  }
}
