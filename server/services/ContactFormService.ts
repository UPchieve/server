import { CustomError } from 'ts-custom-error'
import mongoose from 'mongoose'
import isEmail from 'validator/lib/isEmail'
import isLength from 'validator/lib/isLength'
import MailService from '../services/MailService'
import * as ContactFormSubmissionRepo from '../models/ContactFormSubmission'

interface ContactFormSubmissionData {
  message: string
  topic: string
  email: string
  userId?: string
}

export class ContactFormDataValidationError extends CustomError {
  constructor() {
    super('contact form data was invalid')
  }
}

export class MailSendError extends CustomError {
  constructor(mailType: string) {
    super(`failed to send ${mailType} through email provider`)
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
  return mongoose.Types.ObjectId.isValid(id)
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

function requestBodyIsValid(data: unknown) {
  let hasMessage = false
  let hasTopic = false
  let hasUserEmail = false
  let hasUserId = false

  if (
    Object.prototype.hasOwnProperty.call(data, 'message') &&
    messageIsValid(data.message)
  ) {
    hasMessage = true
  }
  if (
    Object.prototype.hasOwnProperty.call(data, 'topic') &&
    topicIsValid(data.topic)
  ) {
    hasTopic = true
  }
  if (
    Object.prototype.hasOwnProperty.call(data, 'userEmail') &&
    emailIsValid(data.email)
  ) {
    hasUserEmail = true
  }
  if (
    Object.prototype.hasOwnProperty.call(data, 'userId') &&
    userIdIsValid(data.userId)
  ) {
    hasUserId = true
  }

  return hasMessage && hasTopic && (hasUserEmail || hasUserId)
}

function sendContactForm(data: ContactFormSubmissionData, callback: Function) {
  return MailService.sendContactForm(data, callback)
}

export async function saveContactFormSubmission(data: unknown) {
  if (!requestBodyIsValid(data)) {
    throw new ContactFormDataValidationError()
  }
  const validatedData = data as ContactFormSubmissionData
  try {
    if (validatedData.userId === undefined) {
      await ContactFormSubmissionRepo.saveFormWithEmail(validatedData.message, validatedData.topic, validatedData.email)
    } else {
      await ContactFormSubmissionRepo.saveFormWithUser(validatedData.message, validatedData.topic, validatedData.userId)
    }
  } catch (err) {
    throw err
  }
  const mailData = {
    email: validatedData.email,
    message: validatedData.message,
    topic: validatedData.topic
  }
  try {
    await sendContactForm(mailData, function(err) {
      throw err
    })
  } catch (err) {
    throw new MailSendError('contact form submission')
  }
}
