import * as ContactFormSubmissionRepo from '../../models/ContactFormSubmission'
import UserModel from '../../models/User'
import mongoose from "mongoose";
import {insertVolunteer} from "../db-utils";
import {DocCreationError} from "../../models/Errors";
import { Types } from 'mongoose'
import {hugeText} from "../generate";

let user
const message = "This is some great feedback for you!"
const topic = "General feedback"

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  user = await insertVolunteer()
})

afterAll(async () => {
  await UserModel.deleteOne({_id: user._id})
  await mongoose.connection.close()
})

test('save contact form with email', async () => {
  const doc = await ContactFormSubmissionRepo.saveFormWithEmail(message, topic, user.email)
  expect(doc.email).toBe(user.email)
  expect(doc.message).toBe(message)
  expect(doc.topic).toBe(topic)
  expect(doc._id).toBeDefined()
  expect(doc.createdAt).toBeDefined()
  expect(doc.userId).toBeUndefined()
})

test('save contact from with user', async () => {
  const doc = await ContactFormSubmissionRepo.saveFormWithUser(message, topic, user._id)
  expect(doc.userId).toStrictEqual(user._id)
  expect(doc.userId).toBeInstanceOf(Types.ObjectId)
  expect(doc.email).toBe(user.email)
  expect(typeof doc.email).toBe('string')
  expect(doc.message).toBe(message)
  expect(typeof doc.message).toBe('string')
  expect(doc.topic).toBe(topic)
  expect(typeof doc.topic).toBe('string')
  expect(doc._id).toBeDefined()
  expect(doc._id).toBeInstanceOf(Types.ObjectId)
  expect(doc.createdAt).toBeDefined()
  expect(doc.createdAt).toBeInstanceOf(Date)
})

test('contact form rejects invalid email', async () => {
  const invalidEmail = 'test@test'
  try {
    await ContactFormSubmissionRepo.saveFormWithEmail(message, topic, invalidEmail)
  } catch (err) {
    expect(err).toBeInstanceOf(DocCreationError)
  }
})

test('contact form rejects too short message', async () => {
  try {
    await ContactFormSubmissionRepo.saveFormWithEmail('', topic, user.email)
  } catch (err) {
    expect(err).toBeInstanceOf(DocCreationError)
  }
})

test('contact form rejects too long message', async() => {
  try {
    await ContactFormSubmissionRepo.saveFormWithEmail(hugeText(), topic, user.email)
  } catch (err) {
    expect(err).toBeInstanceOf(DocCreationError)
  }
})

test('contact from rejects invalid topic', async () => {
  try {
    await ContactFormSubmissionRepo.saveFormWithEmail(message, 'not valid', user.email)
  } catch (err) {
    expect(err).toBeInstanceOf(DocCreationError)
  }
})
