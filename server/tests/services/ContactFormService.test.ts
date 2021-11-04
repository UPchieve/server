import { mocked } from 'ts-jest/utils'
import * as ContactFormSubmissionRepo from '../../models/ContactFormSubmission/queries'
import { ContactFormSubmission } from '../../models/ContactFormSubmission'
import * as ContactFormService from '../../services/ContactFormService'
import { getObjectId, hugeText } from '../generate'
import * as MailService from '../../services/MailService'
import { InputError } from '../../models/Errors'
jest.mock('../../models/ContactFormSubmission/queries')
jest.mock('../../services/MailService')

const mockedContactFormSubmissionRepo = mocked(ContactFormSubmissionRepo, true)
const mockedMailService = mocked(MailService, true)

const userId = getObjectId()
const validEmailData = {
  userEmail: 'test@test.com',
  message: 'This is some feedback for you.',
  topic: 'General feedback',
}

const validUserIdData = {
  userId,
  userEmail: 'test@test.com',
  message: 'This is some feedback for you.',
  topic: 'General feedback',
}

const invalidEmailData = {
  userId,
  userEmail: 'test@test',
  message: 'This is some feedback for you.',
  topic: 'General feedback',
}

const invalidUserIdData = {
  userId: 'not a valid id',
  userEmail: 'test@test',
  message: 'This is some feedback for you.',
  topic: 'General feedback',
}

const invalidShortMessageData = {
  userId,
  userEmail: 'test@test.com',
  message: '',
  topic: 'General feedback',
}

const invalidLongMessageData = {
  userId,
  userEmail: 'test@test.com',
  message: hugeText(),
  topic: 'General feedback',
}

const invalidTopicData = {
  userId,
  userEmail: 'test@test.com',
  message: 'This is some feedback for you.',
  topic: 'not a valid topic',
}

test('contact form service saves form submission with email', async () => {
  mockedContactFormSubmissionRepo.createContactFormByEmail.mockImplementationOnce(
    () => {
      return new Promise(resolve => {
        const id = getObjectId()
        const doc: ContactFormSubmission = {
          _id: id,
          userEmail: 'test@test.com',
          message: 'This is some feedback for you.',
          topic: 'General feedback',
          createdAt: new Date(),
        }
        resolve(doc)
      })
    }
  )
  mockedMailService.sendContactForm.mockImplementationOnce(() => {
    return new Promise<void>(resolve => {
      resolve()
    })
  })
  try {
    await ContactFormService.saveContactFormSubmission(validEmailData)
  } catch (err) {
    expect(err).toBeUndefined()
  }
})

test('contact form service saves form submission with user id', async () => {
  mockedContactFormSubmissionRepo.createContactFormByEmail.mockImplementationOnce(
    () => {
      return new Promise(resolve => {
        const doc: ContactFormSubmission = {
          _id: getObjectId(),
          userId: getObjectId(),
          userEmail: 'test@test.com',
          message: 'This is some feedback for you.',
          topic: 'General feedback',
          createdAt: new Date(),
        }
        resolve(doc)
      })
    }
  )
  mockedMailService.sendContactForm.mockImplementationOnce(() => {
    return new Promise<void>(resolve => {
      resolve()
    })
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
    expect(err).toBeInstanceOf(InputError)
  }
})

test('contact form service rejects invalid userId', async () => {
  try {
    await ContactFormService.saveContactFormSubmission(invalidUserIdData)
  } catch (err) {
    expect(err).toBeInstanceOf(InputError)
  }
})

test('contact form service rejects too short message', async () => {
  try {
    await ContactFormService.saveContactFormSubmission(invalidShortMessageData)
  } catch (err) {
    expect(err).toBeInstanceOf(InputError)
  }
})

test('contact form service rejects too long message', async () => {
  try {
    await ContactFormService.saveContactFormSubmission(invalidLongMessageData)
  } catch (err) {
    expect(err).toBeInstanceOf(InputError)
  }
})

test('contact form service rejects invalid topic', async () => {
  try {
    await ContactFormService.saveContactFormSubmission(invalidTopicData)
  } catch (err) {
    expect(err).toBeInstanceOf(InputError)
  }
})
