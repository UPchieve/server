import mongoose from 'mongoose'
import * as ContactFormSubmissionRepo from '../../models/ContactFormSubmission'
import UserModel from '../../models/User'
import { insertVolunteer } from '../db-utils'
import { DocCreationError } from '../../models/Errors'
import { hugeText } from '../generate'

let user
const message = 'This is some great feedback for you!'
const topic = 'General feedback'

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  user = await insertVolunteer()
})

afterAll(async () => {
  await UserModel.deleteOne({ _id: user._id })
  await mongoose.connection.close()
})

test('save contact form with email', async () => {
  const doc = await ContactFormSubmissionRepo.createFormWithEmail(
    message,
    topic,
    user.email
  )
  expect(doc.userEmail).toBe(user.email)
  expect(doc.message).toBe(message)
  expect(doc.topic).toBe(topic)
  expect(doc.id).toBeDefined()
  expect(doc.createdAt).toBeDefined()
  expect(doc.userId).toBeUndefined()
})

test('save contact form with user', async () => {
  const doc = await ContactFormSubmissionRepo.createFormWithUser(
    message,
    topic,
    user._id
  )
  expect(doc.userId).toStrictEqual(user._id.toString())
  expect(typeof doc.userId).toBe('string')
  expect(doc.userEmail).toBe(user.email)
  expect(typeof doc.userEmail).toBe('string')
  expect(doc.message).toBe(message)
  expect(typeof doc.message).toBe('string')
  expect(doc.topic).toBe(topic)
  expect(typeof doc.topic).toBe('string')
  expect(doc.id).toBeDefined()
  expect(typeof doc.id).toBe('string')
  expect(doc.createdAt).toBeDefined()
  expect(doc.createdAt).toBeInstanceOf(Date)
})

test('contact form rejects invalid email', async () => {
  const invalidEmail = 'test@test'
  try {
    await ContactFormSubmissionRepo.createFormWithEmail(
      message,
      topic,
      invalidEmail
    )
  } catch (err) {
    expect(err).toBeInstanceOf(DocCreationError)
  }
})

test('contact form rejects too short message', async () => {
  try {
    await ContactFormSubmissionRepo.createFormWithEmail('', topic, user.email)
  } catch (err) {
    expect(err).toBeInstanceOf(DocCreationError)
  }
})

test('contact form rejects too long message', async () => {
  try {
    await ContactFormSubmissionRepo.createFormWithEmail(
      hugeText(),
      topic,
      user.email
    )
  } catch (err) {
    expect(err).toBeInstanceOf(DocCreationError)
  }
})

test('contact from rejects invalid topic', async () => {
  try {
    await ContactFormSubmissionRepo.createFormWithEmail(
      message,
      'not valid',
      user.email
    )
  } catch (err) {
    expect(err).toBeInstanceOf(DocCreationError)
  }
})
