import { z } from 'zod'
import { PgUuidSchema } from '../utils/type-utils'

export const CleverRosterBodySchema = z.object({
  districtId: z.string({ error: 'Missing district id.' }),
})

export const CleverSchoolBodySchema = z.object({
  cleverSchoolId: z.string(),
  upchieveSchoolId: PgUuidSchema,
})

export type CleverRosterUserPublic = {
  id: string
  email: string
  firstName?: string
}

export type CleverRosterFailedUserPublic = {
  email: string
  firstName: string
}

export type CleverRosterUpdatedUserPublic = {
  id: string
  email: string
}

export type CleverRosterSkippedStudentPublic = {
  id: string
  email: string
  gradeLevel?: string
  parsedGradeLevel?: number
}

export type CleverRosterSchoolReportPublic = {
  upchieveSchoolId: string
  created: CleverRosterUserPublic[]
  updated: CleverRosterUpdatedUserPublic[]
  failed: CleverRosterFailedUserPublic[]
  skipped: CleverRosterSkippedStudentPublic[]
}

export type CleverRosterReportPublic = {
  updatedSchools: Record<string, CleverRosterSchoolReportPublic>
  failedSchools: Record<string, string>
}

export type CleverRosterResponsePublic = {
  report: CleverRosterReportPublic
}
