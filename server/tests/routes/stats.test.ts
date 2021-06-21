import { mocked } from 'ts-jest/utils'
import request, { Test } from 'supertest'
import express from 'express'
import bodyParser from 'body-parser'
import { MongoStore } from 'connect-mongo'
import * as SessionService from '../../services/SessionService'
import * as ApiRoutes from '../../router/api'
import SessionStore from '../../router/api/session-store'
import { buildUser } from '../generate'
import { KeyNotFoundError } from '../../cache'
jest.mock('../../services/SessionService')
const mockedSessionService = mocked(SessionService, true)
const mockedSessionStore = mocked(SessionStore, true)

const US_IP_ADDRESS = '161.185.160.93'
const API_ROUTE = '/api'

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const mockLogin = jest.fn()
const mockUser = buildUser({ isVolunteer: true })
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

const VOLUNTEER_WAIT_TIME_HEAT_MAP_PATH = '/stats/volunteer/heatmap'
describe(VOLUNTEER_WAIT_TIME_HEAT_MAP_PATH, () => {
  const mockedHeatMap = {
    Sunday: {
      '12a': 80000000,
      '1a': 0,
      '2a': 0,
      '3a': 0,
      '4a': 0,
      '5a': 0,
      '6a': 0,
      '7a': 0,
      '8a': 0,
      '9a': 0,
      '10a': 0,
      '11a': 0,
      '12p': 0,
      '1p': 0,
      '2p': 0,
      '3p': 0,
      '4p': 0,
      '5p': 0,
      '6p': 0,
      '7p': 0,
      '8p': 0,
      '9p': 0,
      '10p': 0,
      '11p': 0
    },
    Monday: {
      '12a': 200000,
      '1a': 0,
      '2a': 0,
      '3a': 0,
      '4a': 0,
      '5a': 0,
      '6a': 0,
      '7a': 0,
      '8a': 0,
      '9a': 0,
      '10a': 0,
      '11a': 0,
      '12p': 0,
      '1p': 0,
      '2p': 0,
      '3p': 0,
      '4p': 0,
      '5p': 0,
      '6p': 0,
      '7p': 0,
      '8p': 0,
      '9p': 0,
      '10p': 0,
      '11p': 0
    },
    Tuesday: {
      '12a': 0,
      '1a': 0,
      '2a': 0,
      '3a': 0,
      '4a': 0,
      '5a': 0,
      '6a': 0,
      '7a': 0,
      '8a': 0,
      '9a': 0,
      '10a': 0,
      '11a': 0,
      '12p': 0,
      '1p': 0,
      '2p': 0,
      '3p': 0,
      '4p': 0,
      '5p': 0,
      '6p': 0,
      '7p': 0,
      '8p': 0,
      '9p': 0,
      '10p': 0,
      '11p': 0
    },
    Wednesday: {
      '12a': 0,
      '1a': 0,
      '2a': 0,
      '3a': 0,
      '4a': 0,
      '5a': 0,
      '6a': 0,
      '7a': 0,
      '8a': 0,
      '9a': 0,
      '10a': 0,
      '11a': 0,
      '12p': 0,
      '1p': 0,
      '2p': 0,
      '3p': 0,
      '4p': 0,
      '5p': 0,
      '6p': 0,
      '7p': 0,
      '8p': 0,
      '9p': 0,
      '10p': 0,
      '11p': 0
    },
    Thursday: {
      '12a': 0,
      '1a': 0,
      '2a': 0,
      '3a': 0,
      '4a': 0,
      '5a': 0,
      '6a': 0,
      '7a': 0,
      '8a': 0,
      '9a': 0,
      '10a': 0,
      '11a': 0,
      '12p': 0,
      '1p': 0,
      '2p': 0,
      '3p': 0,
      '4p': 0,
      '5p': 0,
      '6p': 0,
      '7p': 0,
      '8p': 0,
      '9p': 0,
      '10p': 0,
      '11p': 0
    },
    Friday: {
      '12a': 0,
      '1a': 0,
      '2a': 0,
      '3a': 0,
      '4a': 0,
      '5a': 0,
      '6a': 0,
      '7a': 0,
      '8a': 0,
      '9a': 0,
      '10a': 0,
      '11a': 0,
      '12p': 0,
      '1p': 0,
      '2p': 0,
      '3p': 0,
      '4p': 0,
      '5p': 0,
      '6p': 0,
      '7p': 0,
      '8p': 0,
      '9p': 0,
      '10p': 0,
      '11p': 0
    },
    Saturday: {
      '12a': 0,
      '1a': 0,
      '2a': 0,
      '3a': 0,
      '4a': 0,
      '5a': 0,
      '6a': 0,
      '7a': 0,
      '8a': 0,
      '9a': 0,
      '10a': 0,
      '11a': 0,
      '12p': 0,
      '1p': 0,
      '2p': 0,
      '3p': 0,
      '4p': 0,
      '5p': 0,
      '6p': 0,
      '7p': 0,
      '8p': 0,
      '9p': 0,
      '10p': 0,
      '11p': 0
    }
  }

  test('Should send wait time heat map with valid GET request', async () => {
    const payload = {}
    mockedSessionService.getWaitTimeHeatMap.mockImplementationOnce(
      async () => mockedHeatMap
    )
    const response = await sendGet(VOLUNTEER_WAIT_TIME_HEAT_MAP_PATH, payload)
    const {
      body: { heatMap }
    } = response
    expect(SessionService.getWaitTimeHeatMap).toHaveBeenCalledTimes(1)
    expect(heatMap).toEqual(mockedHeatMap)
    expect(response.status).toBe(200)
  })

  test('Should send status 404 when the heat map is not found in the cache', async () => {
    const payload = {}
    mockedSessionService.getWaitTimeHeatMap.mockImplementationOnce(async () => {
      throw new KeyNotFoundError('Not found')
    })
    const response = await sendGet(VOLUNTEER_WAIT_TIME_HEAT_MAP_PATH, payload)
    const {
      body: { heatMap }
    } = response
    expect(SessionService.getWaitTimeHeatMap).toHaveBeenCalledTimes(1)
    expect(heatMap).toBeUndefined()
    expect(response.status).toBe(404)
  })
})
