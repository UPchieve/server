import { Ulid } from '../pgUtils'

export type IneligibleStudent = {
  id: Ulid
  email: string
  ipAddress?: string
  // old names for postalCode/schoolId for legacy compatibility
  zipCode?: string
  school?: Ulid
  currentGrade?: string
  createdAt: Date
  updatedAt: Date
}
