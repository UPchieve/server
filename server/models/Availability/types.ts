import { Ulid } from '../pgUtils'
import { DAYS, HOURS } from '../../constants'

export type AvailabilityDay = {
  [hour in HOURS]: boolean
}

export type Availability = {
  [day in DAYS]: AvailabilityDay
}

export interface AvailabilityHistory {
  volunteerId: Ulid
  recordedAt: Date
  availability: Availability
}

export interface AvailabilitySnapshot {
  volunteerId: Ulid
  availability: Availability
}
