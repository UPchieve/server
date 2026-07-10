import type { Uuid } from './shared'

export type SchoolPublic = {
  id: Uuid
  upchieveId: Uuid
  name: string
  districtName: string | undefined
  city: string | undefined
  state: string
}
