import { Ulid } from '../pgUtils'

export type ContactFormSubmission = {
  id: Ulid
  userEmail: string
  userId?: Ulid
  message: string
  topic: string
  createdAt: Date
  updatedAt: Date
}
