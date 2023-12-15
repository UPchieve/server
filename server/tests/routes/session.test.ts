test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import request, { Test } from 'supertest'
import { Types } from 'mongoose'
import _ from 'lodash'

import * as SessionService from '../../services/SessionService'
import * as SessionRepo from '../../models/Session/queries'
import {
  buildNotification,
  buildVolunteer,
  buildUserAgent,
  getObjectId,
  getStringObjectId,
} from '../generate'
import {
  mockedGetAdminFilteredSessions,
  mockedGetCurrentSession,
  mockedGetPublicSession,
  mockedGetSessionByIdWithStudentAndVolunteer,
  mockedGetSessionsToReview,
  mockedGetStudentLatestSession,
} from '../mocks/repos/session-repo'
import { AdminFilteredSessions } from '../../models/Session/queries'
import {
  mockApp,
  mockRouter,
  mockSocketServer,
  mockPassportMiddleware,
} from '../mock-app'
import { routeSession as routeSessions } from '../../router/api/session'
import { authPassport } from '../../utils/auth-utils'

jest.mock('../../services/IpAddressService')

jest.mock('../../services/SessionService')
const mockedSessionService = mocked(SessionService, true)

const US_IP_ADDRESS = '161.185.160.93'
const API_ROUTE = '/api'

const app = mockApp()

const mockGetUser = () => buildVolunteer({ isAdmin: true })
app.use(mockPassportMiddleware(mockGetUser))

const router = mockRouter()
const socketServer = mockSocketServer(app)
routeSessions(router, socketServer)

app.use('/api', authPassport.isAuthenticated, router)

const agent = request.agent(app)

async function sendGetQuery(route: string, payload: any): Promise<Test> {
  return agent
    .get(API_ROUTE + route)
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .query(payload)
    .send()
}

async function sendGet(route: string, payload: any): Promise<Test> {
  return agent
    .get(API_ROUTE + route)
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .send(payload)
}

async function sendPost(route: string, payload: any): Promise<Test> {
  return agent
    .post(API_ROUTE + route)
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .send(payload)
}

async function sendPut(route: string, payload: any): Promise<Test> {
  return agent
    .put(API_ROUTE + route)
    .set('X-Forwarded-For', US_IP_ADDRESS)
    .set('Accept', 'application/json')
    .send(payload)
}

function stringifyObjectIdsAndDates(data: any) {
  const item = { ...data }
  for (const [key, value] of Object.entries(data)) {
    if (
      typeof value === 'object' &&
      Types.ObjectId.isValid(value as Types.ObjectId)
    )
      item[key] = value!.toString()
    if (value instanceof Date) item[key] = value.toISOString()
  }

  return item
}

// obj = _.mapValues(obj, stringifyObjectId)
function stringifyObjectId(data: any): any {
  if (data instanceof Types.ObjectId) return data.toString()
  else if (data instanceof Date) return data.toISOString()
  else if (typeof data === 'object' && !Array.isArray(data))
    return _.mapValues(data, stringifyObjectId)
  else if (Array.isArray(data)) return data.map(x => stringifyObjectId(x))
  else return data
}

function stringifyArrayResponse<T>(data: Array<T>) {
  return data.map(item => stringifyObjectIdsAndDates(item))
}

beforeEach(async () => {
  jest.clearAllMocks()
  jest.resetAllMocks()
})

afterAll(() => {
  socketServer.close()
})

const SESSION_NEW_PATH = '/session/new'
describe(SESSION_NEW_PATH, () => {
  test('Should send sessionId with valid request', async () => {
    const payload = {}
    const id = getObjectId()
    mockedSessionService.startSession.mockResolvedValueOnce(id)
    const response = await sendPost(SESSION_NEW_PATH, payload)
    const {
      body: { sessionId },
    } = response
    expect(SessionService.startSession).toHaveBeenCalledTimes(1)
    expect(sessionId).toEqual(id.toString())
  })
})

const SESSION_END_PATH = '/session/end'
describe(SESSION_END_PATH, () => {
  test('Should send InputError when the sessionId is missing from the request body', async () => {
    const payload = {}
    mockedSessionService.endSession.mockImplementationOnce(
      async () => undefined
    )
    const response = await sendPost(SESSION_END_PATH, payload)
    const {
      body: { err },
    } = response
    expect(SessionService.endSession).toHaveBeenCalledTimes(0)
    expect(err).toBe('Missing sessionId body string')
  })

  test('Should send sessionId with valid request', async () => {
    const id = getStringObjectId()
    const payload = { sessionId: id }
    mockedSessionService.endSession.mockImplementationOnce(
      async () => undefined
    )
    const response = await sendPost(SESSION_END_PATH, payload)
    const {
      body: { sessionId },
    } = response
    expect(SessionService.endSession).toHaveBeenCalledTimes(1)
    expect(sessionId).toBe(id)
  })
})

const SESSION_CHECK_PATH = '/session/check'
describe(SESSION_CHECK_PATH, () => {
  test('Should send InputError when the sessionId is missing from the request body', async () => {
    const payload = {}
    mockedSessionService.checkSession.mockImplementationOnce(async () => '')
    const response = await sendPost(SESSION_CHECK_PATH, payload)
    const {
      body: { err },
    } = response
    expect(SessionService.checkSession).toHaveBeenCalledTimes(0)
    expect(err).toBe('Missing sessionId body string')
  })

  test('Should send sessionId with a valid request', async () => {
    const mockValue = getStringObjectId()
    const payload = { sessionId: mockValue }
    mockedSessionService.checkSession.mockImplementationOnce(
      async () => mockValue
    )
    const response = await sendPost(SESSION_CHECK_PATH, payload)
    const {
      body: { sessionId },
    } = response
    expect(SessionService.checkSession).toHaveBeenCalledTimes(1)
    expect(sessionId).toEqual(mockValue)
  })
})

const SESSION_CURRENT_PATH = '/session/current'
describe(SESSION_CURRENT_PATH, () => {
  test('Should send LookupError when no session is found', async () => {
    const payload = {}
    mockedSessionService.currentSession.mockImplementationOnce(
      async () => undefined
    )
    const response = await sendPost(SESSION_CURRENT_PATH, payload)
    const {
      body: { err },
    } = response
    expect(response.status).toEqual(404)
    expect(SessionService.currentSession).toHaveBeenCalledTimes(1)
    expect(err).toBe('No current session')
  })

  test('Should send sessionId and session when a session is found', async () => {
    const payload = {}
    const currentSession = mockedGetCurrentSession()
    mockedSessionService.currentSession.mockResolvedValueOnce(
      currentSession as SessionRepo.CurrentSession
    )
    const response = await sendPost(SESSION_CURRENT_PATH, payload)
    const {
      body: { sessionId, data },
    } = response
    expect(SessionService.currentSession).toHaveBeenCalledTimes(1)
    expect(sessionId).toEqual(currentSession._id.toString())
    expect(data).toEqual(_.mapValues(currentSession, stringifyObjectId))
  })
})

const SESSION_LATEST_PATH = '/session/latest'
describe(SESSION_LATEST_PATH, () => {
  test('Should send InputError when the userId is missing from the request body', async () => {
    const payload = {}

    const response = await sendPost(SESSION_LATEST_PATH, payload)
    const {
      body: { err },
    } = response
    expect(SessionService.studentLatestSession).toHaveBeenCalledTimes(0)
    expect(err).toBe('Missing userId body string')
  })

  test('Should send sessionId and session when a session is found', async () => {
    const payload = { userId: getStringObjectId() }
    const latestSession = mockedGetStudentLatestSession()
    mockedSessionService.studentLatestSession.mockImplementationOnce(
      async () => latestSession
    )
    const response = await sendPost(SESSION_LATEST_PATH, payload)
    const {
      body: { sessionId, data },
    } = response
    expect(SessionService.studentLatestSession).toHaveBeenCalledTimes(1)
    expect(sessionId).toEqual(latestSession._id)
    expect(data).toEqual(latestSession)
  })
})

const SESSION_REVIEW_PATH = '/session/review'
describe(SESSION_REVIEW_PATH, () => {
  test('Should send sessions and isLastPage with valid request', async () => {
    const sessionsToReview = [
      mockedGetSessionsToReview(),
      mockedGetSessionsToReview(),
    ]
    const mockedValue = { isLastPage: true, sessions: sessionsToReview }
    mockedSessionService.sessionsToReview.mockResolvedValueOnce(mockedValue)

    const response = await sendGetQuery(SESSION_REVIEW_PATH, {})
    const {
      body: { sessions, isLastPage },
    } = response
    expect(SessionService.sessionsToReview).toHaveBeenCalledTimes(1)
    expect(isLastPage).toBe(mockedValue.isLastPage)
    expect(sessions).toEqual(stringifyArrayResponse(mockedValue.sessions))
  })
})

const UPDATE_SESSION_REVIEW_PATH = (sessionId: string) =>
  `/session/${sessionId}`
describe(UPDATE_SESSION_REVIEW_PATH(':sessionId'), () => {
  test('Should update the session with valid request', async () => {
    const sessionId = getObjectId().toString()
    mockedSessionService.reviewSession.mockImplementationOnce(
      async () => undefined
    )
    const response = await sendPut(UPDATE_SESSION_REVIEW_PATH(sessionId), {})
    expect(SessionService.reviewSession).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
  })
})

const SESSION_PHOTO_URL_PATH = (sessionId: string) =>
  `/session/${sessionId}/photo-url`
describe(SESSION_PHOTO_URL_PATH(':sessionId'), () => {
  test('Should send uploadUrl and imageUrl with valid request', async () => {
    const sessionId = getObjectId().toString()
    const expected = {
      uploadUrl: 'https://upload.com.b4.com/12345',
      imageUrl: 'https://upload.com/12345',
    }
    mockedSessionService.getImageAndUploadUrl.mockImplementationOnce(
      async () => expected
    )
    const response = await sendGet(SESSION_PHOTO_URL_PATH(sessionId), {})
    expect(SessionService.getImageAndUploadUrl).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
  })
})

const SESSION_REPORT_PATH = (sessionId: string) =>
  `/session/${sessionId}/report`
describe(SESSION_REPORT_PATH(':sessionId'), () => {
  test('Should send success message with valid request', async () => {
    const sessionId = getObjectId().toString()
    mockedSessionService.reportSession.mockImplementationOnce(
      async () => undefined
    )
    const {
      body: { msg },
    } = await sendPost(SESSION_REPORT_PATH(sessionId), {})
    expect(SessionService.reportSession).toHaveBeenCalledTimes(1)
    expect(msg).toBe('Success')
  })
})

const SESSION_TIMED_OUT_PATH = (sessionId: string) =>
  `/session/${sessionId}/timed-out`
describe(SESSION_TIMED_OUT_PATH(':sessionId'), () => {
  test('Should send status code 200 with valid request', async () => {
    const sessionId = getObjectId().toString()
    const response = await sendPost(SESSION_TIMED_OUT_PATH(sessionId), {})
    expect(SessionService.sessionTimedOut).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
  })
})

const SESSION_ADMIN_VIEW_PATH = '/sessions'
describe(SESSION_ADMIN_VIEW_PATH, () => {
  test('Should send sessions and isLastPage with valid request', async () => {
    const filteredSessions = [
      mockedGetAdminFilteredSessions(),
      mockedGetAdminFilteredSessions(),
    ] as AdminFilteredSessions[]
    const expected = { isLastPage: true, sessions: filteredSessions }
    mockedSessionService.adminFilteredSessions.mockImplementationOnce(
      async () => expected
    )
    const response = await sendGet(SESSION_ADMIN_VIEW_PATH, {})
    const {
      body: { sessions, isLastPage },
    } = response

    expect(SessionService.adminFilteredSessions).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
    expect(isLastPage).toBe(expected.isLastPage)
    expect(sessions).toEqual(stringifyArrayResponse(expected.sessions))
  })
})

const SESSION_ADMIN_SESSION_VIEW_PATH = (sessionId: string) =>
  `/session/${sessionId}/admin`
describe(SESSION_ADMIN_SESSION_VIEW_PATH(':sessionId'), () => {
  test('Should send session with valid request', async () => {
    const mockSession = mockedGetSessionByIdWithStudentAndVolunteer({
      type: 'college',
    })
    const mockValue = {
      ...mockSession,
      userAgent: buildUserAgent(),
      feedbacks: [],
      photos: [],
    }
    mockedSessionService.adminSessionView.mockImplementationOnce(
      // @todo: fix
      // @ts-expect-error
      async () => mockValue
    )
    const response = await sendGet(
      SESSION_ADMIN_SESSION_VIEW_PATH(mockSession._id.toString()),
      {}
    )
    const {
      body: { session },
    } = response
    const student = stringifyObjectIdsAndDates(mockValue.student)
    const volunteer = stringifyObjectIdsAndDates(mockValue.volunteer)
    const expected = {
      ...mockValue,
      _id: mockValue._id.toString(),
      createdAt: mockValue.createdAt.toISOString(),
      student,
      volunteer,
    }
    expect(SessionService.adminSessionView).toHaveBeenCalledTimes(1)
    expect(session).toEqual(expected)
  })
})

const SESSION_PUBLIC_PATH = (sessionId: string) => `/session/${sessionId}`
describe(SESSION_PUBLIC_PATH(':sessionId'), () => {
  test('Should send status code 200 with valid request', async () => {
    const expected = mockedGetPublicSession()
    mockedSessionService.publicSession.mockResolvedValueOnce(expected)
    const response = await sendGet(
      SESSION_PUBLIC_PATH(expected._id.toString()),
      {}
    )
    const {
      body: { session },
    } = response
    expect(SessionService.publicSession).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
    expect(session._id).toEqual(expected._id.toString())
  })
})

const SESSION_NOTIFICATIONS_PATH = (sessionId: string) =>
  `/session/${sessionId}/notifications`
describe(SESSION_NOTIFICATIONS_PATH(':sessionId'), () => {
  test('Should send notifications with valid request', async () => {
    const notificationOne = buildNotification()
    const notificationTwo = buildNotification()
    const mockedNotifications = [notificationOne, notificationTwo]
    mockedSessionService.getSessionNotifications.mockImplementationOnce(
      async () => mockedNotifications
    )
    const response = await sendGet(SESSION_NOTIFICATIONS_PATH('123456789'), {})
    const {
      body: { notifications },
    } = response
    expect(SessionService.getSessionNotifications).toHaveBeenCalledTimes(1)
    expect(notifications).toEqual(stringifyArrayResponse(mockedNotifications))
  })
})
*/
