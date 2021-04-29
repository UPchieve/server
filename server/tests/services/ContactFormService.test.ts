import { mocked } from 'ts-jest/utils'
import { Types } from 'mongoose'
import * as ContactFormSubmissionRepo from '../../models/ContactFormSubmission'
import * as ContactFormService from '../../services/ContactFormService'
import { hugeText } from '../generate'
import * as MailService from '../../services/MailService'
import { ContactFormDataValidationError } from '../../services/ContactFormService'
jest.mock('../../models/ContactFormSubmission')
jest.mock('../../services/MailService')

const mockedContactFormSubmissionRepo = mocked(ContactFormSubmissionRepo, true)
const mockedMailService = mocked(MailService, true)

const validEmailData = {
  userEmail: 'test@test.com',
  message: 'This is some feedback for you.',
  topic: 'General feedback'
}

const validUserIdData = {
  userId: '43rTcoyKkRD2UCHK658RJQBUwqnN6jiu',
  userEmail: 'test@test.com',
  message: 'This is some feedback for you.',
  topic: 'General feedback'
}

const invalidEmailData = {
  userId: '43rTcoyKkRD2UCHK658RJQBUwqnN6jiu',
  userEmail: 'test@test',
  message: 'This is some feedback for you.',
  topic: 'General feedback'
}

const invalidUserIdData = {
  userId: 'not a valid id',
  userEmail: 'test@test',
  message: 'This is some feedback for you.',
  topic: 'General feedback'
}

const invalidShortMessageData = {
  userId: '43rTcoyKkRD2UCHK658RJQBUwqnN6jiu',
  userEmail: 'test@test.com',
  message: '',
  topic: 'General feedback'
}

const invalidLongMessageData = {
  userId: '43rTcoyKkRD2UCHK658RJQBUwqnN6jiu',
  userEmail: 'test@test.com',
  message: hugeText(),
  topic: 'General feedback'
}

const invalidTopicData = {
  userId: '43rTcoyKkRD2UCHK658RJQBUwqnN6jiu',
  userEmail: 'test@test.com',
  message: 'This is some feedback for you.',
  topic: 'not a valid topic'
}

test('contact form service saves form submission with email', async () => {
  mockedContactFormSubmissionRepo.createFormWithEmail.mockImplementationOnce(
    () => {
      return new Promise(resolve => {
        const id = Types.ObjectId().toString()
        const doc: ContactFormSubmissionRepo.ContactFormSubmission = {
          id: id,
          userEmail: 'test@test.com',
          message: 'This is some feedback for you.',
          topic: 'General feedback',
          createdAt: new Date()
        }
        resolve(doc)
      })
    }
  )
  mockedMailService.sendContactForm.mockImplementationOnce(() => {
    return null
  })
  try {
    await ContactFormService.saveContactFormSubmission(validEmailData)
  } catch (err) {
    expect(err).toBeUndefined()
  }
})

test('contact form service saves form submission with user id', async () => {
  mockedContactFormSubmissionRepo.createFormWithEmail.mockImplementationOnce(
    () => {
      return new Promise(resolve => {
        const id = Types.ObjectId().toString()
        const doc: ContactFormSubmissionRepo.ContactFormSubmission = {
          id: id,
          userId: '43rTcoyKkRD2UCHK658RJQBUwqnN6jiu',
          userEmail: 'test@test.com',
          message: 'This is some feedback for you.',
          topic: 'General feedback',
          createdAt: new Date()
        }
        resolve(doc)
      })
    }
  )
  mockedMailService.sendContactForm.mockImplementationOnce(() => {
    return null
  })
  try {
    await ContactFormService.saveContactFormSubmission(validUserIdData)
  } catch (err) {
    expect(err).toBeUndefined()
  }
})

test('contact form service rejects invalid email', async () => {
  try {
    await ContactFormService.saveContactFormSubmission(invalidEmailData)
  } catch (err) {
    expect(err).toBeInstanceOf(ContactFormDataValidationError)
  }
})

test('contact form service rejects invalid userId', async () => {
  try {
    await ContactFormService.saveContactFormSubmission(invalidUserIdData)
  } catch (err) {
    expect(err).toBeInstanceOf(ContactFormDataValidationError)
  }
})

test('contact form service rejects too short message', async () => {
  try {
    await ContactFormService.saveContactFormSubmission(invalidShortMessageData)
  } catch (err) {
    expect(err).toBeInstanceOf(ContactFormDataValidationError)
  }
})

test('contact form service rejects too long message', async () => {
  try {
    await ContactFormService.saveContactFormSubmission(invalidLongMessageData)
  } catch (err) {
    expect(err).toBeInstanceOf(ContactFormDataValidationError)
  }
})

test('contact form service rejects invalid topic', async () => {
  try {
    await ContactFormService.saveContactFormSubmission(invalidTopicData)
  } catch (err) {
    expect(err).toBeInstanceOf(ContactFormDataValidationError)
  }
})
