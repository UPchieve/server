import { Ulid } from '../pgUtils'

// new signature does not support usage of 'upchieveId'
// reference regular id in the backend instead of upchieveId
// frontend: clone id prop into the upchieveId prop to support legacy code
export type School = {
  id: Ulid
  nameStored: string
  stateStored: string
  isApproved: boolean
  isPartner: boolean
  createdAt: Date
  updatedAt: Date
  cityNameStored?: string
  mongoId?: string
  districtNameStored?: string
  SCHOOL_YEAR?: string
  FIPST?: number
  ST?: string
  SCH_NAME?: string
  LEA_NAME?: string
  ST_SCHID?: string
  MCITY?: string
  MZIP?: number
  LCITY?: string
  LZIP?: number
  G_9_OFFERED?: string
  G_10_OFFERED?: string
  G_11_OFFERED?: string
  G_12_OFFERED?: string

  // virtuals
  // TODO get the following from the query
  name?: string
  districtName?: string
  city?: string
  state?: string
}
