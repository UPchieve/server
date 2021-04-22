import {Document, model, Model, Schema, Types} from 'mongoose'
import UserModel, {User, UserDocument} from './User'
import {DocCreationError, InvalidEmailError, InvalidIdError, UserNotFoundError} from './Errors'
import mongoose from 'mongoose'
import isEmail from 'validator/lib/isEmail'
import isLength from 'validator/lib/isLength'
import {CustomError} from 'ts-custom-error'

export type ContactFormSubmissionDocument = ContactFormSubmission & Document

export class ContactFormSubmission {
  _id: Types.ObjectId
  createdAt: Date
  userEmail: string
  userId: Types.ObjectId | User
  topic: string
  content: string
  model: Model<ContactFormSubmissionDocument>
  private topics = [
    'General question',
    'General feedback',
    'Technical issue',
    'Feature request',
    'Subject suggestion',
    'Other'
  ]

  static schema = new Schema({
    createdAt: {
      type: Date,
      default: Date.now
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    userEmail: {
      type: String,
      default: '',
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
    this.model = model('ContactFormSubmission', ContactFormSubmission.schema)
  }

  async saveContactFormSubmission(content, topic, userEmail?, userId?: string) {
    // validate main args
    if (!this.topicIsValid(topic)) {
      throw new InvalidTopicError(topic)
    }
    if (!ContactFormSubmission.contentIsValid(content)) {
      throw new InvalidContentError()
    }
    // if we don't pass the user id at all, we'll assume we want to use the email
    // instead, as the form probably came from a non-logged-in user
    if (userId === undefined) {
      // validate that the email is good, otherwise we don't have enough information
      // to handle the form
      if (!ContactFormSubmission.emailIsValid(userEmail)) {
        throw new InvalidEmailError(userEmail)
      }
      return this.saveFormWithEmail(content, topic, userEmail)
    } else {
      let user
      try {
        user = await ContactFormSubmission.getUserIdAndEmail(userId)
      } catch (err: InvalidIdError | UserNotFoundError) {
        throw err
      }
      return this.saveFormWithUser(content, topic, user.email, user.id)
    }
  }

  private async saveFormWithEmail(content, topic, userEmail: string) {
    const cfs = new this.model({
      content,
      userEmail,
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

  private async saveFormWithUser(content, topic, userEmail: string, userId: Types.ObjectId) {
    const cfs = new this.model({
      content,
      userEmail,
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
    if (!ContactFormSubmission.userIdIsValid(id)) {
      throw new InvalidIdError()
    }

    let user: UserDocument
    try {
      user = await UserModel.findById(id, {_id: 1, email: 1})
    } catch (err) {
      throw new UserNotFoundError('_id', id)
    }
    return {
      id: user._id as Types.ObjectId,
      email: user.email
    }
  }

  private static userIdIsValid(id: string) {
    return mongoose.Types.ObjectId.isValid(id)
  }

  private static emailIsValid(email: string) {
    return isEmail(email)
  }

  private static contentIsValid(content: string) {
    return isLength(content, {
      min: 1,
      max: 500
    })
  }

  private topicIsValid(topic: string) {
    return this.topics.includes(topic)
  }
}

export class InvalidTopicError extends CustomError {
  constructor(topic: string) {
    super(`${topic} is not a valid contact form topic`)
  }
}

export class InvalidContentError extends CustomError {
  constructor() {
    super('content was less than 1 character or more than 500 characters')
  }
}
