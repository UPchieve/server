import { mocked } from 'ts-jest/utils'
import request, { Test } from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'
import { MongoStore } from 'connect-mongo'
import { ObjectId } from 'mongodb'
import * as ApiRoutes from '../../router/api'
import { buildUser } from '../generate'
import * as StudentService from '../../services/StudentService'
import SessionStore from '../../router/api/session-store'
import { validTypes } from '../../models/Session'
import { UserNotFoundError } from '../../models/Errors'
jest.mock('../../services/IpAddressService')

jest.mock('../../services/StudentService')

const mockedStudentService = mocked(StudentService, true)
const mockedSessionStore = mocked(SessionStore, true)

const US_IP_ADDRESS = '161.185.160.93'
const API_ROUTE = '/api'

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const mockLogin = jest.fn()
function mockPassportMiddleware(req, res, next) {
  req.login = mockLogin
  next()
}
function mockUserMiddleware(req, res, next) {
  req.user = buildUser({ _id: new ObjectId('612262eb168710905a2b1b89') })
  next()
}
app.use(mockPassportMiddleware)
app.use(mockUserMiddleware)
ApiRoutes.routes(app, (mockedSessionStore as unknown) as MongoStore)

const agent = request.agent(app)

async function sendGet(route: string, payload: any): Promise<Test> {
  return agent
    .get(API_ROUTE + route)
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .send(payload)
}

beforeEach(async () => {
  jest.clearAllMocks()
  jest.resetAllMocks()
})

describe('/v1/students/1/recent-subjects', () => {
  test('Should return a list if this is a valid ID', async () => {
    const expectedTypes = [{type: 'math', subTopic: validTypes[1]}, {type: 'math', subTopic: validTypes[2]}, {type: 'math', subTopic: validTypes[3]}]
    mockedStudentService.getMostRecentSessionInfo.mockImplementationOnce(
      async () => expectedTypes
    )

    const response = await sendGet('/v1/students/recent-subjects', {})

    expect(StudentService.getMostRecentSessionInfo).toHaveBeenCalledWith(
      '612262eb168710905a2b1b89',
      3
    )
    expect(response.status).toBe(200)
    expect(response.text).toStrictEqual(
      JSON.stringify({ sessions: expectedTypes })
    )
  })

  test('Should return an empty list if there are none to return', async () => {
    mockedStudentService.getMostRecentSessionInfo.mockImplementationOnce(
      async () => []
    )

    const response = await sendGet('/v1/students/recent-subjects', {})

    expect(StudentService.getMostRecentSessionInfo).toHaveBeenCalledWith(
      '612262eb168710905a2b1b89',
      3
    )
    expect(response.status).toBe(200)
    expect(response.text).toStrictEqual(JSON.stringify({ sessions: [] }))
  })

  test('Should return a 400 if the student ID is valid, but no student was found', async () => {
    mockedStudentService.getMostRecentSessionInfo.mockImplementationOnce(
      async () => {
        throw new UserNotFoundError('id', '612262eb168710905a2b1b89')
      }
    )

    const response = await sendGet('/v1/students/recent-subjects', {})

    expect(StudentService.getMostRecentSessionInfo).toHaveBeenCalledWith(
      '612262eb168710905a2b1b89',
      3
    )
    expect(response.status).toBe(400)
  })

  test('Should return a 500 if some unknown error is encountered', async () => {
    mockedStudentService.getMostRecentSessionInfo.mockImplementationOnce(
      async () => {
        throw new Error('My internal server error')
      }
    )

    const response = await sendGet('/v1/students/recent-subjects', {})

    expect(StudentService.getMostRecentSessionInfo).toHaveBeenCalledWith(
      '612262eb168710905a2b1b89',
      3
    )
    expect(response.status).toBe(500)
  })
})
