import { AvailabilityDay, availabilityDaySchema } from './types'
import { Document, model, Schema, Types } from 'mongoose';

export interface AvailabilityHistory {
  _id: Types.ObjectId;
  volunteerId: Types.ObjectId;
  date: Date;
  timezone: string;
  availability: AvailabilityDay;
  modifiedAt: Date;
  createdAt: Date;
}

export type AvailabilityHistoryDocument = AvailabilityHistory & Document;

const availabilityHistorySchema = new Schema({
  _id: {
    type: Types.ObjectId,
  },
  availability: {
    type: availabilityDaySchema,
    default: availabilityDaySchema,
  },
  volunteerId: {
    type: Types.ObjectId,
  },
  date: {
    type: Date,
  },
  timezone: {
    type: String,
  },
  modifiedAt: {
    type: Date,
    default: Date.now(),
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  }
});

const AvailabilityHistoryModel = model<AvailabilityHistoryDocument>('AvailabilityHistory', availabilityHistorySchema);

module.exports = AvailabilityHistoryModel
export default AvailabilityHistoryModel
