import { CustomError } from 'ts-custom-error'
import { Types } from 'mongoose'
import isEmail from 'validator/lib/isEmail'
import isLength from 'validator/lib/isLength'
import * as ContactFormSubmissionRepo from '../models/ContactFormSubmission'
import logger from '../logger'
import * as MailService from './MailService/smtp'
import nr from 'newrelic'

interface ContactFormSubmissionData {
  message: string
  topic: string
  userEmail: string
  userId?: string
}

export class ContactFormDataValidationError extends CustomError {
  constructor(errors: string[]) {
    super(`contact form data was invalid: ${errors}`)
  }
}

export class MailSendError extends CustomError {
  constructor(mailType, err: string) {
    super(`failed to send ${mailType} through email provider: ${err}`)
  }
}

const topics = [
  'General question',
  'General feedback',
  'Technical issue',
  'Feature request',
  'Subject suggestion',
  'Other'
]

function topicIsValid(topic: string) {
  return topics.includes(topic)
}

function userIdIsValid(id: string) {
  return Types.ObjectId.isValid(id)
}

function emailIsValid(email: string) {
  return isEmail(email)
}

function messageIsValid(message: string) {
  return isLength(message, {
    min: 1,
    max: 500
  })
}

function requestBodyIsValid(
  data: unknown
): { valid: boolean; errors: string[] } {
  let validMessage = false
  let validTopic = false
  let validUserEmail = false
  let validUserId = false

  let valid = false
  const errors: string[] = []

  if (
    Object.prototype.hasOwnProperty.call(data, 'message') &&
    messageIsValid((data as ContactFormSubmissionData).message)
  ) {
    validMessage = true
  } else {
    errors.push('message is invalid')
  }
  if (
    Object.prototype.hasOwnProperty.call(data, 'topic') &&
    topicIsValid((data as ContactFormSubmissionData).topic)
  ) {
    validTopic = true
  } else {
    errors.push('topic is invalid')
  }
  if (
    Object.prototype.hasOwnProperty.call(data, 'userEmail') &&
    emailIsValid((data as ContactFormSubmissionData).userEmail)
  ) {
    validUserEmail = true
  } else {
    errors.push('email is invalid')
  }
  if (
    Object.prototype.hasOwnProperty.call(data, 'userId') &&
    userIdIsValid((data as ContactFormSubmissionData).userId)
  ) {
    validUserId = true
  } else {
    errors.push('user id is invalid')
  }

  if (validMessage && validTopic && (validUserEmail || validUserId)) {
    valid = true
  }

  return {
    valid,
    errors
  }
}

async function sendContactForm(data: {
  topic: string
  message: string
  email: string
}) {
  try {
    await MailService.sendContactFormEmail(data)
  } catch (err) {
    throw new MailSendError('contact form submission', err.message)
  }
}

export async function saveContactFormSubmission(data: unknown) {
  const validity = requestBodyIsValid(data)
  if (!validity.valid) {
    throw new ContactFormDataValidationError(validity.errors)
  }
  const validatedData = data as ContactFormSubmissionData
  await nr.startSegment('service:contactFormSubmission:saveToDatabase', true, async () => {
    try {
      if (!validatedData.userId) {
        await ContactFormSubmissionRepo.createFormWithEmail(
          validatedData.message,
          validatedData.topic,
          validatedData.userEmail
        )
      } else {
        await ContactFormSubmissionRepo.createFormWithUser(
          validatedData.message,
          validatedData.topic,
          validatedData.userId
        )
      }
    } catch (err) {
      throw err
    }
  })

  const mailData = {
    email: validatedData.userEmail,
    message: validatedData.message,
    topic: validatedData.topic
  }
  await nr.startSegment('service:contactFormSubmission:sendEmail', true, async () => {
    try {
      await sendContactForm(mailData)
    } catch (err) {
      throw err
    }
  })
}
