import { Ulid } from '../pgUtils'

export type IpAddress = {
  id: Ulid
  ip: string
  status?: string
  createdAt: Date
  updatedAt: Date
}
