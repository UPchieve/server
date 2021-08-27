import { mocked } from 'ts-jest/utils'
import request, { Test } from 'supertest'
import express from 'express'
import * as ApiRoutes from '../../router/api'
import bodyParser from 'body-parser'
import { buildUser } from '../generate'
import * as StudentService from '../../services/StudentService'
import SessionStore from '../../router/api/session-store'
import { MongoStore } from 'connect-mongo'
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
const mockUser = buildUser({ isAdmin: true })
function mockPassportMiddleware(req, res, next) {
  req.login = mockLogin
  next()
}
function mockUserMiddleware(req, res, next) {
  req.user = mockUser
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
    const expectedTypes = [validTypes[1], validTypes[2], validTypes[3]]
    mockedStudentService.getMostRecentSessionTypes.mockImplementationOnce(async () => expectedTypes)

    const response = await sendGet('/v1/students/612262eb168710905a2b1b89/recent-subjects', {})

    expect(StudentService.getMostRecentSessionTypes).toHaveBeenCalledWith('612262eb168710905a2b1b89', 3)
    expect(response.status).toBe(200)
    expect(response.text).toStrictEqual(JSON.stringify({types: expectedTypes}))
  })

  test('Should return an empty list if there are none to return', async () => {
    mockedStudentService.getMostRecentSessionTypes.mockImplementationOnce(async () => [])

    const response = await sendGet('/v1/students/612262eb168710905a2b1b89/recent-subjects', {})

    expect(StudentService.getMostRecentSessionTypes).toHaveBeenCalledWith('612262eb168710905a2b1b89', 3)
    expect(response.status).toBe(200)
    expect(response.text).toStrictEqual(JSON.stringify({types: []}))
  })

  test('Should return a 422 if student is not found', async () => {

    const response = await sendGet('/v1/students/a/recent-subjects', {})

    expect(StudentService.getMostRecentSessionTypes).not.toHaveBeenCalled()
    expect(response.status).toBe(422)
  })


  test('Should return a 400 if the student ID is valid, but no student was found', async () => {
    mockedStudentService.getMostRecentSessionTypes.mockImplementationOnce(async () => {throw new UserNotFoundError('id', '612262eb168710905a2b1b89')})

    const response = await sendGet('/v1/students/612262eb168710905a2b1b89/recent-subjects', {})

    expect(StudentService.getMostRecentSessionTypes).toHaveBeenCalledWith('612262eb168710905a2b1b89', 3)
    expect(response.status).toBe(400)
  })

  test('Should return a 500 if some unknown error is encountered, but should not reveal details about the failure', async () => {
    mockedStudentService.getMostRecentSessionTypes.mockImplementationOnce(async () => {throw new Error('My internal server error')})

    const response = await sendGet('/v1/students/612262eb168710905a2b1b89/recent-subjects', {})

    expect(StudentService.getMostRecentSessionTypes).toHaveBeenCalledWith('612262eb168710905a2b1b89', 3)
    expect(response.status).toBe(500)
    expect(response).not.toContain('My internal server error')
  })
})
