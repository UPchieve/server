import { model, Schema, Types } from 'mongoose'
import isEmail from 'validator/lib/isEmail'
import UserModel, { UserDocument } from './User'
import { DocCreationError, UserNotFoundError } from './Errors'

export interface ContactFormSubmission {
  id: string
  createdAt: Date
  userEmail: string
  userId?: string
  topic: string
  message: string
}

const contactFormSubmissionSchema = new Schema({
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
    required: [true, 'email is required'],
    validate: {
      validator: v => {
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

const ContactFormSubmissionModel = model(
  'ContactFormSubmission',
  contactFormSubmissionSchema
)

// TODO: put this in the User Repo once we have that refactored
async function getUserIdAndEmail(id: string) {
  let user: UserDocument
  try {
    user = await UserModel.findById(id, { _id: 1, email: 1 })
  } catch (err) {
    throw new UserNotFoundError('_id', id)
  }
  return {
    id: user._id as Types.ObjectId,
    userEmail: user.email
  }
}

export async function createFormWithUser(
  message,
  topic,
  userId: string
): Promise<ContactFormSubmission> {
  // validate that the user exists
  let userEmail: string
  let userObjectId: Types.ObjectId
  try {
    const data = await getUserIdAndEmail(userId)
    userObjectId = data.id
    userEmail = data.userEmail
  } catch (err) {
    throw err
  }
  // use validated data on the form
  const cfs = new ContactFormSubmissionModel({
    message,
    userEmail,
    userId: userObjectId,
    topic
  })
  let createdDoc
  try {
    createdDoc = await cfs.save()
  } catch (err) {
    throw new DocCreationError(err.message)
  }
  return {
    id: createdDoc._id.toString(),
    createdAt: createdDoc.createdAt,
    userEmail: createdDoc.userEmail,
    userId: createdDoc.userId.toString(),
    topic: createdDoc.topic,
    message: createdDoc.message
  }
}

export async function createFormWithEmail(
  message,
  topic,
  userEmail: string
): Promise<ContactFormSubmission> {
  const cfs = new ContactFormSubmissionModel({
    message,
    userEmail,
    topic
  })
  let createdDoc
  try {
    createdDoc = await cfs.save()
  } catch (err) {
    throw new DocCreationError(err.message)
  }
  return {
    id: createdDoc._id.toString(),
    createdAt: createdDoc.createdAt,
    userEmail: createdDoc.userEmail,
    topic: createdDoc.topic,
    message: createdDoc.message
  }
}
