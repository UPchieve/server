import { model, Schema, Types, Document, ValidatorProps } from 'mongoose'
import isEmail from 'validator/lib/isEmail'

export interface ContactFormSubmission {
  _id: Types.ObjectId
  createdAt: Date
  userEmail: string
  userId?: Types.ObjectId
  topic: string
  message: string
}

export type ContactFormSubmissionDocument = ContactFormSubmission & Document

const contactFormSubmissionSchema = new Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  userEmail: {
    type: String,
    default: '',
    required: [true, 'email is required'],
    validate: {
      validator: (v: string) => {
        return isEmail(v)
      },
      message: (props: ValidatorProps) => `${props.value} is not a valid email`,
    },
  },
  topic: {
    type: String,
    default: '',
    required: true,
    // TODO: pull this emun out to consts
    enum: [
      'General question',
      'General feedback',
      'Technical issue',
      'Feature request',
      'Subject suggestion',
      'Other',
    ],
  },
  message: {
    type: String,
    default: '',
    required: [true, 'message is required'],
    minLength: 1,
    maxLength: 300,
  },
})

const ContactFormSubmissionModel = model(
  'ContactFormSubmission',
  contactFormSubmissionSchema
)

export default ContactFormSubmissionModel
