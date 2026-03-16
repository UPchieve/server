import { z } from 'zod'
import { PgUuidSchema } from '../utils/type-utils'
import { NTHSCandidateApplicationStatus } from '../types/nths'

export const NTHSCreateCandidateApplicationSchema = z.object({
  status: z.enum(NTHSCandidateApplicationStatus),
  userId: PgUuidSchema,
  deniedNotes: z.string().optional(),
})

export type NTHSCreateCandidateApplicationPublic = {
  // TODO: change to UUID shared type
  id: number
  userId: string
  status: NTHSCandidateApplicationStatus
  // TODO: Change to date string type
  createdAt: string
}
