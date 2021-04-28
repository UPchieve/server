import { Document, model, Schema, Types } from 'mongoose'
import UserModel, { User, UserDocument } from './User'
import { DocCreationError, UserNotFoundError } from './Errors'
import isEmail from 'validator/lib/isEmail'

interface ContactFormSubmission {
  _id: Types.ObjectId
  createdAt: Date
  email: string
  userId: Types.ObjectId | User
  topic: string
  message: string
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
    default: '',
    required: [true, 'email is required'],
    validate: {
      validator: (v) => {
        return isEmail(v)
      },
      message: props => `${props.value} is not a valid email`
    }
  },
  topic: {
    type: String,
    default: '',
    required: true,
    enum: [
      'General question',
      'General feedback',
      'Technical issue',
      'Feature request',
      'Subject suggestion',
      'Other'
    ]
  },
  message: {
    type: String,
    default: '',
    required: [true, 'message is required'],
    minLength: 1,
    maxLength: 300
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
  message,
  topic,
  userId: string
): Promise<ContactFormSubmissionDocument> {
  // validate that the user exists
  let email: string
  let userObjectId: Types.ObjectId
  try {
    const data = await getUserIdAndEmail(userId)
    userObjectId = data.id
    email = data.email
  } catch (err) {
    throw err
  }
  // use validated data on the form
  const cfs = new contactFormSubmissionModel({
    message,
    email,
    userId: userObjectId,
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
  message,
  topic,
  email: string
): Promise<ContactFormSubmissionDocument> {
  const cfs = new contactFormSubmissionModel({
    message,
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
