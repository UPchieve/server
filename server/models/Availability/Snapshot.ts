import { Document, model, Schema, Types } from 'mongoose'
import { Availability, availabilityDaySchema, DAYS } from './types'

export interface AvailabilitySnapshot {
  _id: Types.ObjectId
  volunteerId: Types.ObjectId
  onCallAvailability: Availability
  modifiedAt: Date
  createdAt: Date
  timezone: string
}

export type AvailabilitySnapshotDocument = AvailabilitySnapshot & Document

const availabilityWeekSchema = new Schema(
  {
    [DAYS.SUNDAY]: {
      type: availabilityDaySchema,
      default: () => ({})
    },
    [DAYS.MONDAY]: {
      type: availabilityDaySchema,
      default: () => ({})
    },
    [DAYS.TUESDAY]: {
      type: availabilityDaySchema,
      default: () => ({})
    },
    [DAYS.WEDNESDAY]: {
      type: availabilityDaySchema,
      default: () => ({})
    },
    [DAYS.THURSDAY]: {
      type: availabilityDaySchema,
      default: () => ({})
    },
    [DAYS.FRIDAY]: {
      type: availabilityDaySchema,
      default: () => ({})
    },
    [DAYS.SATURDAY]: {
      type: availabilityDaySchema,
      default: () => ({})
    }
  },
  { _id: false }
)

const availabilitySnapshotSchema = new Schema({
  volunteerId: {
    type: Types.ObjectId
  },
  onCallAvailability: {
    type: availabilityWeekSchema,
    default: () => ({})
  },
  modifiedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  timezone: String
})

const AvailabilitySnapshotModel = model<AvailabilitySnapshotDocument>(
  'AvailabilitySnapshot',
  availabilitySnapshotSchema
)

module.exports = AvailabilitySnapshotModel
export default AvailabilitySnapshotModel
