import { Ulid } from '../pgUtils'

export const DAYS = <const>[
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
export type DAYS = typeof DAYS[number]

export const HOURS = <const>[
  '12a',
  '1a',
  '2a',
  '3a',
  '4a',
  '5a',
  '6a',
  '7a',
  '8a',
  '9a',
  '10a',
  '11a',
  '12p',
  '1p',
  '2p',
  '3p',
  '4p',
  '5p',
  '6p',
  '7p',
  '8p',
  '9p',
  '10p',
  '11p',
]
export type HOURS = typeof HOURS[number]

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
