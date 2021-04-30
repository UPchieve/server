import request from 'supertest'
import express from 'express'
import { mocked } from 'ts-jest/utils'
import mongoose from 'mongoose'
import * as ContactFormRouter from '../../router/contact'
import * as ContactFormService from '../../services/ContactFormService'
import { DocCreationError, UserNotFoundError } from '../../models/Errors'
import {
  ContactFormDataValidationError,
  MailSendError
} from '../../services/ContactFormService'
jest.mock('../../services/ContactFormService')

const mockedContactFormService = mocked(ContactFormService, true)

const app = express()
ContactFormRouter.routes(app)

const agent = request.agent(app)

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})

test('contact form returns 200 with valid request with only email', async () => {
  mockedContactFormService.saveContactFormSubmission.mockImplementationOnce(
    () => {
      return new Promise(resolve => {
        resolve()
      })
    }
  )
  const res = await agent
    .post('/api-public/contact/send')
    .set('Accept', 'application/json')
    .send({
      userEmail: 'test@test.com',
      message: 'This is some feedback for you.',
      topic: 'General feedback'
    })

  expect(res.status).toEqual(200)
  expect(res.body.message).toEqual('contact form submission has been sent')
})

test('contact form returns 200 with valid request with userId', async () => {
  mockedContactFormService.saveContactFormSubmission.mockImplementationOnce(
    () => {
      return new Promise(resolve => {
        resolve()
      })
    }
  )
  const id = mongoose.Types.ObjectId().toString()
  const res = await agent
    .post('/api-public/contact/send')
    .set('Accept', 'application/json')
    .send({
      userEmail: 'test@test.com',
      message: 'This is some feedback for you.',
      topic: 'General feedback',
      userId: id
    })

  expect(res.status).toEqual(200)
  expect(res.body.message).toEqual('contact form submission has been sent')
})

test('contact form returns 400 with invalid userId', async () => {
  const id = mongoose.Types.ObjectId().toString()
  mockedContactFormService.saveContactFormSubmission.mockImplementationOnce(
    () => {
      return new Promise((resolve, reject) => {
        reject(new UserNotFoundError('userId', id))
      })
    }
  )
  const res = await agent
    .post('/api-public/contact/send')
    .set('Accept', 'application/json')
    .send({
      userEmail: 'test@test.com',
      message: 'This is some feedback for you.',
      topic: 'General feedback',
      userId: id
    })

  expect(res.status).toEqual(400)
  expect(res.body.error).toEqual(
    `user not found via parameter userId and value ${id}`
  )
})

test('contact form returns 400 with invalid data', async () => {
  const id = mongoose.Types.ObjectId().toString()
  mockedContactFormService.saveContactFormSubmission.mockImplementationOnce(
    () => {
      return new Promise((resolve, reject) => {
        reject(new ContactFormDataValidationError(['your data was bad']))
      })
    }
  )
  const res = await agent
    .post('/api-public/contact/send')
    .set('Accept', 'application/json')
    .send({
      userEmail: 'test@test.com',
      message: 'This is some feedback for you.',
      topic: 'General feedback',
      userId: id
    })

  expect(res.status).toEqual(400)
  expect(res.body.error).toEqual('')
})

test('contact form returns 500 with invalid data', async () => {
  const id = mongoose.Types.ObjectId().toString()
  mockedContactFormService.saveContactFormSubmission.mockImplementationOnce(
    () => {
      return new Promise((resolve, reject) => {
        reject(new MailSendError('contact form submission', 'an error'))
      })
    }
  )
  const res = await agent
    .post('/api-public/contact/send')
    .set('Accept', 'application/json')
    .send({
      userEmail: 'test@test.com',
      message: 'This is some feedback for you.',
      topic: 'General feedback',
      userId: id
    })

  expect(res.status).toEqual(500)
  expect(res.body.error).toEqual('')
})

test('contact form returns 500 with doc creation error', async () => {
  const id = mongoose.Types.ObjectId().toString()
  mockedContactFormService.saveContactFormSubmission.mockImplementationOnce(
    () => {
      return new Promise((resolve, reject) => {
        reject(new DocCreationError())
      })
    }
  )
  const res = await agent
    .post('/api-public/contact/send')
    .set('Accept', 'application/json')
    .send({
      userEmail: 'test@test.com',
      message: 'This is some feedback for you.',
      topic: 'General feedback',
      userId: id
    })

  expect(res.status).toEqual(500)
  expect(res.body.error).toEqual('')
})
