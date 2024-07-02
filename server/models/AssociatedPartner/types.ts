import { Ulid } from '../pgUtils'

export type AssociatedPartner = {
  key: string
  studentSponsorOrg?: string
  studentSponsorOrgId?: Ulid
  studentPartnerOrg?: string
  studentPartnerOrgId?: Ulid
  studentOrgDisplay?: string
  volunteerPartnerOrg: string
  volunteerOrgDisplay: string
}

export type AssociatedPartnersAndSchools = {
  associatedStudentPartnerOrgs: string[]
  associatedPartnerSchools: string[]
}
