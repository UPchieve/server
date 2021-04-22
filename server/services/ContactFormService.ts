import { CustomError } from 'ts-custom-error'
import mongoose from 'mongoose'
import isEmail from 'validator/lib/isEmail'
import isLength from 'validator/lib/isLength'
import { Repository } from '../models/Repository'
import MailService from '../services/MailService'

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

export class ContactFormService {
  private repo: Repository

  private topics = [
    'General question',
    'General feedback',
    'Technical issue',
    'Feature request',
    'Subject suggestion',
    'Other'
  ]

  constructor(repo: Repository) {
    this.repo = repo
  }

  async saveContactFormSubmission(data: unknown) {
    if (!this.requestBodyIsValid(data)) {
      throw new ContactFormDataValidationError()
    }
    const validatedData = data as ContactFormSubmissionData
    try {
      await this.repo.saveContactFormSubmission(
        validatedData.message,
        validatedData.topic,
        validatedData.email,
        validatedData.userId
      )
    } catch (err) {
      throw err
    }
  }

  sendContactForm(data: ContactFormSubmissionData, callback: Function) {
    return MailService.sendContactForm(data, callback)
  }

  private requestBodyIsValid(data: unknown) {
    let hasMessage = false
    let hasTopic = false
    let hasUserEmail = false
    let hasUserId = false

    if (
      Object.prototype.hasOwnProperty.call(data, 'message') &&
      ContactFormService.messageIsValid(data.message)
    ) {
      hasMessage = true
    }
    if (
      Object.prototype.hasOwnProperty.call(data, 'topic') &&
      this.topicIsValid(data.topic)
    ) {
      hasTopic = true
    }
    if (
      Object.prototype.hasOwnProperty.call(data, 'userEmail') &&
      ContactFormService.emailIsValid(data.email)
    ) {
      hasUserEmail = true
    }
    if (
      Object.prototype.hasOwnProperty.call(data, 'userId') &&
      ContactFormService.userIdIsValid(data.userId)
    ) {
      hasUserId = true
    }

    return hasMessage && hasTopic && (hasUserEmail || hasUserId)
  }

  private static userIdIsValid(id: string) {
    return mongoose.Types.ObjectId.isValid(id)
  }

  private static emailIsValid(email: string) {
    return isEmail(email)
  }

  private static messageIsValid(message: string) {
    return isLength(message, {
      min: 1,
      max: 500
    })
  }

  private topicIsValid(topic: string) {
    return this.topics.includes(topic)
  }
}
