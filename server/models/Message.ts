import { Document, model, Schema, Types } from 'mongoose'
import { User } from './User'

export interface Message {
  _id: Types.ObjectId
  user: Types.ObjectId | User
  contents: string
  createdAt: Date
}

export type MessageDocument = Message & Document

const messageSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: 'User'
    },
    contents: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    toJSON: {
      virtuals: true
    },

    toObject: {
      virtuals: true
    }
  }
)

messageSchema.virtual('userId').get(function(this: any) {
  return this.user._id || this.user
})

messageSchema.virtual('name').get(function(this: any) {
  // only works if user is populated
  return this.user.firstname
})

messageSchema.virtual('isVolunteer').get(function(this: any) {
  // only works if user is populated
  return this.user.isVolunteer
})

const MessageModel = model<MessageDocument>('Message', messageSchema)

export default MessageModel
