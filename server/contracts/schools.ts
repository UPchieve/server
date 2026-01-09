import { z } from 'zod'
import { PgUuidSchema } from '../utils/type-utils'

export const GetSchoolsQuerySchema = z.object({
  name: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  ncesId: z.string().optional(),
  isPartner: z.coerce.boolean().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
})

export const GetSchoolParamsSchema = z.object({
  schoolId: PgUuidSchema,
})

export type GetSchoolsPayload = z.infer<typeof GetSchoolsQuerySchema>

export type AdminSchoolPublic = {
  id: string
  name: string
  city: string
  state: string
  isAdminApproved: boolean
  isPartner: boolean
  ncesId?: string
  zip?: string
  district?: string
  schoolYear?: string
  isSchoolWideTitle1?: boolean
  title1SchoolStatus?: string
  nationalSchoolLunchProgram?: string
  totalStudents?: number
  nslpDirectCertification?: number
  frlEligible?: number
}

export type GetAdminSchoolsPublic = {
  isLastPage: boolean
  totalCount: number
  schools: AdminSchoolPublic[]
}

export type AdminPartnerSchoolPublic = {
  schoolName: string
  partnerKey?: string
  partnerSites?: string[]
  schoolId: string
}
