import { Document, model, Schema, Types } from 'mongoose'
import UserModel, { User, UserDocument } from './User'
import { DocCreationError, UserNotFoundError } from './Errors'

interface ContactFormSubmission {
  _id: Types.ObjectId
  createdAt: Date
  email: string
  userId: Types.ObjectId | User
  topic: string
  content: string
}

export type ContactFormSubmissionDocument = ContactFormSubmission & Document

const contactFormSubmissionSchema = new Schema({
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

const contactFormSubmissionModel = model('ContactFormSubmission', contactFormSubmissionSchema)

async function getUserIdAndEmail(id: string) {
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

export async function saveFormWithUser(
  content,
  topic,
  userId: string
): Promise<ContactFormSubmissionDocument> {
  // validate that the user exists
  let email: string
  try {
    const data = await getUserIdAndEmail(userId)
    userId = data.id.toString()
    email = data.email
  } catch (err) {
    throw err
  }
  // use validated data on the form
  const cfs = new contactFormSubmissionModel({
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

export async function saveFormWithEmail(
  content,
  topic,
  email: string
): Promise<ContactFormSubmissionDocument> {
  const cfs = new contactFormSubmissionModel({
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
