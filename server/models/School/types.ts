import { Ulid } from '../pgUtils'

// new signature does not support usage of 'upchieveId'
// reference regular id in the backend instead of upchieveId
// frontend: clone id prop into the upchieveId prop to support legacy code
export type School = {
  id: Ulid
  name: string
  city: string
  state: string
  zip?: string
  district?: string
  isAdminApproved?: boolean
  isApproved?: boolean
  isPartner?: boolean
  schoolYear?: string
  isSchoolWideTitle1?: boolean
  isTitle1Eligible?: boolean
  nationalSchoolLunchProgram?: string
  totalStudents?: number
  nslpDirectCertification?: number
  frlEligible?: number
}

export type PartnerSchool = {
  schoolName: string
  partnerKey?: string
  partnerSites?: string[]
  schoolId: string
}
