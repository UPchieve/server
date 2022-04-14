import { Pgid, Ulid } from '../pgUtils'

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
