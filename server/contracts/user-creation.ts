import { z } from 'zod'
import { PgUuidSchema } from '../utils/type-utils'

export const RosterStudentsBodySchema = z.object({
  schoolId: PgUuidSchema,
})

export type RosterStudentsResultPublic = {
  failed: {
    email: string
    firstName: string
  }[]
  updated: {
    id: string
    email: string
  }[]
}
