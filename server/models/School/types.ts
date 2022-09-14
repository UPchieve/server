import { Ulid } from '../pgUtils'

export type AdminSchool = {
  id: Ulid
  name: string
  city: string
  state: string
  isApproved: boolean
  isPartner: boolean
}

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
  districtNameStored?: string // stored as lea_name
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

  // virtuals
  name?: string
  districtName?: string
  city?: string
  state?: string
}
