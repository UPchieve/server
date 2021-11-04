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
      ref: 'User',
    },
    contents: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
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

messageSchema.virtual('userId').get(function(this: MessageDocument) {
  return this.user instanceof Types.ObjectId
    ? this.user
    : (this.user as User)._id
})

messageSchema.virtual('name').get(function(this: MessageDocument) {
  // only works if user is populated
  if ('firstname' in this.user) return this.user.firstname
})

messageSchema.virtual('isVolunteer').get(function(this: MessageDocument) {
  // only works if user is populated
  if ('isVolunteer' in this.user) return this.user.isVolunteer
})

const MessageModel = model<MessageDocument>('Message', messageSchema)

export default MessageModel
