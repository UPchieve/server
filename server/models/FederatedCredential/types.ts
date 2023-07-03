import { Ulid } from '../pgUtils'

export type FederatedCredential = {
  id: string
  issuer: string
  userId: Ulid
}
