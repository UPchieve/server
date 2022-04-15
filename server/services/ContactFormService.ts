import { CustomError } from 'ts-custom-error'
import { Ulid } from '../models/pgUtils'
import isEmail from 'validator/lib/isEmail'
import isLength from 'validator/lib/isLength'
import nr from 'newrelic'
import * as ContactFormSubmissionRepo from '../models/ContactFormSubmission/queries'
import * as MailService from './MailService'
import { asString, asFactory, asOptional } from '../utils/type-utils'
import { InputError } from '../models/Errors'

interface ContactFormSubmissionData {
  message: string
  topic: string
  userEmail: string
  userId?: Ulid
}
const asContactFormSubmissionData = asFactory<ContactFormSubmissionData>({
  message: asString,
  topic: asString,
  userEmail: asString,
  userId: asOptional(asString),
})

export class MailSendError extends CustomError {
  constructor(mailType: string, err: string) {
    super(`failed to send ${mailType} through email provider: ${err}`)
  }
}

const topics = [
  'General question',
  'General feedback',
  'Technical issue',
  'Feature request',
  'Subject suggestion',
  'Other',
]

function topicIsValid(topic: string) {
  return topics.includes(topic)
}

function messageIsValid(message: string) {
  return isLength(message, {
    min: 1,
    max: 500,
  })
}

// TODO: this function is redundant
async function sendContactForm(topic: string, message: string, email: string) {
  try {
    await MailService.sendContactForm({
      topic,
      message,
      email,
    })
  } catch (err) {
    throw new MailSendError('contact form submission', (err as Error).message)
  }
}

export async function saveContactFormSubmission(data: unknown) {
  const { topic, userEmail, userId, message } = asContactFormSubmissionData(
    data
  )
  if (!topicIsValid(topic) || !isEmail(userEmail) || !messageIsValid(message))
    throw new InputError('Contact form submission data not valid')
  await nr.startSegment(
    'service:contactFormSubmission:saveToDatabase',
    true,
    async () => {
      try {
        if (!userId) {
          await ContactFormSubmissionRepo.createContactFormByEmail(
            message,
            topic,
            userEmail
          )
        } else {
          await ContactFormSubmissionRepo.createContactFormByUser(
            userId,
            message,
            topic
          )
        }
      } catch (err) {
        throw err
      }
    }
  )

  await nr.startSegment(
    'service:contactFormSubmission:sendEmail',
    true,
    async () => {
      try {
        await sendContactForm(userEmail, message, topic)
      } catch (err) {
        throw err
      }
    }
  )
}
