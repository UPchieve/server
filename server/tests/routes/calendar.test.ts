test.todo('postgres migration')
/*import mongoose from 'mongoose'
import request, { Test } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../mock-app'
import { buildAvailability, buildVolunteer } from '../generate'
import { Availability } from '../../models/Availability/types'
import { routeCalendar } from '../../router/api/calendar'

jest.mock('../../controllers/CalendarCtrl')

// mock app - passport should attach any user we need
const app = mockApp()
const mockGetUser = jest.fn()
app.use(mockPassportMiddleware(mockGetUser))

// use the calendar router
const router = mockRouter()
routeCalendar(router)
app.use('/api', router)

const agent = request.agent(app)

interface Form {
  tz?: string
  availability?: Availability
}

const saveCalendar = async (form: Form): Promise<Test> =>
  agent
    .post('/api/calendar/save')
    .set('Accept', 'application/json')
    .send(form)

const clearCalendar = async (form: Form): Promise<Test> =>
  agent
    .post('/api/calendar/clear')
    .set('Accept', 'application/json')
    .send(form)

// db connection
beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('Calendar routes', () => {
  const volunteer = buildVolunteer()
  mockGetUser.mockReturnValue(volunteer)

  test('Volunteer should see error when saving without availability object', async () => {
    const input = {
      tz: 'American/New York',
    }

    const response = await saveCalendar(input)

    const {
      body: { err },
    } = response
    const expected = 'No availability object specified'
    expect(err).toEqual(expected)
  })

  // TODO: update calendar ctrl to follow new service pattern with proper typeguards
  test.todo('Volunteer should see error when availability misses required keys')
  test.todo('postgres migration')
/*  async () => {
    const availability = buildAvailability()
    availability.Saturday = undefined
    const input = {
      tz: 'American/New York',
      availability
    }

    const response = await saveCalendar(input)

    const {
      body: { err }
    } = response
    const expected = 'Availability object missing required keys'
    expect(err).toEqual(expected)
  }
  *

  test('Volunteer should save schedule', async () => {
    const availability = buildAvailability({
      Saturday: { '1a': true },
      Friday: { '11a': true },
    })
    const input = {
      tz: 'American/New York',
      availability,
    }

    const response = await saveCalendar(input)

    const {
      body: { msg, err },
    } = response
    expect(err).toBeUndefined()
    const expected = 'Schedule saved'
    expect(msg).toEqual(expected)
  })

  test('Volunteer should be able to clear schedule', async () => {
    const input = {
      tz: 'American/New York',
    }

    const response = await clearCalendar(input)

    const {
      body: { msg },
    } = response
    const expected = 'Schedule cleared'
    expect(msg).toEqual(expected)
  })
})
*/
