test.todo('postgres migration')
/*import mongoose from 'mongoose'
import * as ContactFormSubmissionRepo from '../../models/ContactFormSubmission/queries'
import UserModel, { User } from '../../models/User'
import { insertVolunteer } from '../db-utils'
import { RepoCreateError } from '../../models/Errors'
import { hugeText } from '../generate'

let user: User
const message = 'This is some great feedback for you!'
const topic = 'General feedback'

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
  user = await insertVolunteer()
})

afterAll(async () => {
  await UserModel.deleteOne({ _id: user._id })
  await mongoose.connection.close()
})

test('save contact form by email', async () => {
  const doc = await ContactFormSubmissionRepo.createContactFormByEmail(
    message,
    topic,
    user.email
  )
  expect(doc.userEmail).toBe(user.email)
  expect(doc.message).toBe(message)
  expect(doc.topic).toBe(topic)
  expect(doc._id).toBeDefined()
  expect(doc.createdAt).toBeDefined()
  expect(doc.userId).toBeUndefined()
})

test('save contact form by user', async () => {
  const doc = await ContactFormSubmissionRepo.createContactFormByUser(
    message,
    topic,
    user._id
  )
  expect(doc.userId).toStrictEqual(user._id)
  expect(doc.userEmail).toBe(user.email)
  expect(doc.message).toBe(message)
  expect(doc.topic).toBe(topic)
  expect(doc._id).toBeDefined()
  expect(doc.createdAt).toBeDefined()
  expect(doc.createdAt).toBeInstanceOf(Date)
})

test('contact form rejects invalid email', async () => {
  const invalidEmail = 'test@test'
  try {
    await ContactFormSubmissionRepo.createContactFormByEmail(
      message,
      topic,
      invalidEmail
    )
  } catch (err) {
    expect(err).toBeInstanceOf(RepoCreateError)
  }
})

test('contact form rejects too short message', async () => {
  try {
    await ContactFormSubmissionRepo.createContactFormByEmail(
      '',
      topic,
      user.email
    )
  } catch (err) {
    expect(err).toBeInstanceOf(RepoCreateError)
  }
})

test('contact form rejects too long message', async () => {
  try {
    await ContactFormSubmissionRepo.createContactFormByEmail(
      hugeText(),
      topic,
      user.email
    )
  } catch (err) {
    expect(err).toBeInstanceOf(RepoCreateError)
  }
})

test('contact from rejects invalid topic', async () => {
  try {
    await ContactFormSubmissionRepo.createContactFormByEmail(
      message,
      'not valid',
      user.email
    )
  } catch (err) {
    expect(err).toBeInstanceOf(RepoCreateError)
  }
})
*/
