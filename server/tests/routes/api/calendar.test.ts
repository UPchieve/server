import { mocked } from 'jest-mock'
import request, { Test } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { buildAvailability, buildVolunteer } from '../../mocks/generate'
import { routeCalendar } from '../../../router/api/calendar'
import * as CalendarCtrl from '../../../controllers/CalendarCtrl'

jest.mock('../../../controllers/CalendarCtrl')

const mockedCalendarCtrl = mocked(CalendarCtrl)
const mockUser = buildVolunteer()

function mockGetUser() {
  return mockUser
}

const router = mockRouter()
routeCalendar(router)

const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))
app.use('/api', router)

const agent = request.agent(app)

function sendPost(payload: object): Test {
  return agent
    .post('/api/calendar/save')
    .set('Accept', 'application/json')
    .send(payload)
}

describe('POST /api/calendar/save', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('should save schedule successfully', async () => {
    const availability = buildAvailability()
    availability.Monday['9a'] = true
    availability.Wednesday['3p'] = true
    const payload = {
      availability,
      tz: 'America/New_York',
    }

    mockedCalendarCtrl.updateSchedule.mockResolvedValueOnce()

    const response = await sendPost(payload)
    expect(mockedCalendarCtrl.updateSchedule).toHaveBeenCalledWith({
      ...payload,
      user: mockUser,
      ip: expect.any(String),
    })
    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      msg: 'Schedule saved',
    })
  })

  test('should return 422 when availability is missing', async () => {
    const payload = {
      tz: 'America/New_York',
    }

    const response = await sendPost(payload)
    expect(mockedCalendarCtrl.updateSchedule).not.toHaveBeenCalled()
    expect(response.status).toBe(422)
  })

  test('should return an error when updateSchedule throws', async () => {
    const payload = {
      availability: buildAvailability(true),
      tz: 'America/New_York',
    }
    mockedCalendarCtrl.updateSchedule.mockRejectedValueOnce(
      new Error('Unexpected failure')
    )

    const response = await sendPost(payload)
    expect(mockedCalendarCtrl.updateSchedule).toHaveBeenCalledWith({
      ...payload,
      user: mockUser,
      ip: expect.any(String),
    })
    expect(response.status).toBeGreaterThanOrEqual(400)
  })
})
