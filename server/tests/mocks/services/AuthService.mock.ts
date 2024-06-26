import { GRADES } from '../../../constants'
import {
  OpenStudentRegData,
  PartnerStudentRegData,
  PartnerVolunteerRegData,
  VolunteerRegData,
} from '../../../utils/auth-utils'
import { buildStudentPartnerOrg, buildUserRow, getIpAddress } from '../generate'

export const buildStudentRegistrationForm = (
  overrides: Partial<OpenStudentRegData> = {}
): OpenStudentRegData => {
  const student = buildUserRow()
  const form = {
    ip: getIpAddress(),
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    password: student.password,
    terms: true,
    zipCode: '11201',
    highSchoolId: '111111111111',
    currentGrade: GRADES.EIGHTH,
    ...overrides,
  } as OpenStudentRegData

  return form
}

export const buildPartnerStudentRegistrationForm = (
  overrides: Partial<PartnerStudentRegData> = {}
): PartnerStudentRegData => {
  const student = buildUserRow()
  const partnerOrg = buildStudentPartnerOrg()
  const form = {
    ip: getIpAddress(),
    firstName: student.firstName,
    lastName: student.lastName,
    email: student.email,
    password: student.password,
    terms: true,
    studentPartnerOrg: partnerOrg.name,
    studentPartnerSite: undefined,
    partnerUserId: partnerOrg.key,
    college: 'UPchieve University',
    ...overrides,
  } as PartnerStudentRegData

  return form
}

export const buildVolunteerRegistrationForm = (
  overrides: Partial<VolunteerRegData> = {}
): VolunteerRegData => {
  const volunteer = buildUserRow()
  const form = {
    ip: getIpAddress(),
    firstName: volunteer.firstName,
    lastName: volunteer.lastName,
    email: volunteer.email,
    password: volunteer.password,
    phone: volunteer.phone,
    terms: true,
    ...overrides,
  } as VolunteerRegData

  return form
}

export const buildPartnerVolunteerRegistrationForm = (
  overrides: Partial<PartnerVolunteerRegData> = {}
): PartnerVolunteerRegData => {
  const volunteer = buildUserRow()
  const form = {
    ip: getIpAddress(),
    volunteerPartnerOrg: 'example',
    firstName: volunteer.firstName,
    lastName: volunteer.lastName,
    email: volunteer.email,
    password: volunteer.password,
    phone: volunteer.phone,
    terms: true,
    ...overrides,
  } as PartnerVolunteerRegData

  return form
}
