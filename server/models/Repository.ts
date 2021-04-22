import { Document } from 'mongoose'
import { ContactFormSubmission } from './ContactFormSubmission'

export class Repository {
  private ContactFormSubmission: ContactFormSubmission

  constructor() {
    this.ContactFormSubmission = new ContactFormSubmission()
  }

  async saveContactFormSubmission(
    content,
    topic,
    email?,
    userId?: string
  ): Promise<ContactFormSubmission & Document> {
    return this.ContactFormSubmission.saveContactFormSubmission(
      content,
      topic,
      email,
      userId
    )
  }
}
