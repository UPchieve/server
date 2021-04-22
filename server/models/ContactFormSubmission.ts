import { Document, model, Model, Schema, Types } from 'mongoose'
import UserModel, { User, UserDocument } from './User'
import { DocCreationError, UserNotFoundError } from './Errors'

export type ContactFormSubmissionDocument = ContactFormSubmission & Document

export class ContactFormSubmission {
  _id: Types.ObjectId
  createdAt: Date
  email: string
  userId: Types.ObjectId | User
  topic: string
  content: string
  Model: Model<ContactFormSubmissionDocument>

  static schema = new Schema({
    createdAt: {
      type: Date,
      default: Date.now
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    email: {
      type: String,
      default: ''
    },
    topic: {
      type: String,
      default: '',
      required: true
    },
    content: {
      type: String,
      default: '',
      required: true
    }
  })

  constructor() {
    this.Model = model('ContactFormSubmission', ContactFormSubmission.schema)
  }

  async saveContactFormSubmission(content, topic, email, userId?: string) {
    // we validate args at the service level, so at this point we can assume that the args are valid
    // if we don't pass the user id at all, we'll assume we want to use the email
    // instead, as the form probably came from a non-logged-in user
    if (userId === undefined) {
      // validate that the email is good, otherwise we don't have enough information
      // to handle the form
      return this.saveFormWithEmail(content, topic, email)
    } else {
      let user
      try {
        user = await ContactFormSubmission.getUserIdAndEmail(userId)
      } catch (err) {
        throw err
      }
      return this.saveFormWithUser(content, topic, user.email, user.id)
    }
  }

  private async saveFormWithEmail(
    content,
    topic,
    email: string
  ): Promise<ContactFormSubmission & Document> {
    const cfs = new this.Model({
      content,
      email,
      topic
    })
    let createdDoc
    try {
      createdDoc = await cfs.save()
    } catch (err) {
      throw new DocCreationError(err.message)
    }
    return createdDoc
  }

  private async saveFormWithUser(
    content,
    topic,
    email: string,
    userId: Types.ObjectId
  ): Promise<ContactFormSubmission & Document> {
    const cfs = new this.Model({
      content,
      email,
      userId,
      topic
    })
    let createdDoc
    try {
      createdDoc = await cfs.save()
    } catch (err) {
      throw new DocCreationError(err.message)
    }
    return createdDoc
  }

  private static async getUserIdAndEmail(id: string) {
    let user: UserDocument
    try {
      user = await UserModel.findById(id, { _id: 1, email: 1 })
    } catch (err) {
      throw new UserNotFoundError('_id', id)
    }
    return {
      id: user._id as Types.ObjectId,
      email: user.email
    }
  }
}
