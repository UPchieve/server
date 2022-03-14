/**
 * Model that stores push token information
 * to send to users for push notifications
 *
 */
import { Document, model, Schema, Types } from 'mongoose'
import { Ulid } from '../pgUtils'
import { User } from '../User'

export type PgPushToken = {
  id: Ulid
  // Using old userId prop name for legacy compatibility
  user: Ulid
  token: string
  createdAt: Date
  updatedAt: Date
}

export interface PushToken {
  _id: Types.ObjectId
  user: Types.ObjectId | User
  createdAt: Date
  token: string
}

export type PushTokenDocument = PushToken & Document

const pushTokenSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User',
    },
    createdAt: { type: Date, default: Date.now },
    // Token ID returned from push token register
    token: { type: String, unique: true },
  },
  {
    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  }
)

const PushTokenModel = model<PushTokenDocument>('PushToken', pushTokenSchema)

export default PushTokenModel
