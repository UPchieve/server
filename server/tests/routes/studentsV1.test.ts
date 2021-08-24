import { mocked } from 'ts-jest/utils'
import request, { Test } from 'supertest'
import express from 'express'
import * as ApiRoutes from '../../router/api'
import bodyParser from 'body-parser'
import { buildUser } from '../generate'
// import * as SessionService from '../../services/SessionService'
import * as StudentService from '../../services/StudentService'
import SessionStore from '../../router/api/session-store'
import { MongoStore } from 'connect-mongo'
import { validTypes } from '../../models/Session'
jest.mock('../../services/IpAddressService')

// jest.mock('../../services/SessionService')
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

describe('/v1/students/1/recent-subjects', async () => {
  test('Should return a list if this is a valid ID', async () => {
    const expectedTypes = [validTypes[1], validTypes[2], validTypes[3]]
    mockedStudentService.getMostRecentSessionTypes.mockImplementationOnce(async () => expectedTypes)

    const response = await sendGet('/v1/students/1/recent-subjects', {})

    expect(StudentService.getMostRecentSessionTypes).toHaveBeenCalledWith('1', 3)
    expect(response).toStrictEqual({types: expectedTypes})
  })
})
