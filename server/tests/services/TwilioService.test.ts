import moment from 'moment'
import 'moment-timezone'
import mongoose from 'mongoose'
import { mocked } from 'ts-jest/utils'
import * as TwilioService from '../../services/TwilioService'
import { MATH_SUBJECTS, SAT_SUBJECTS } from '../../constants'
import {
  buildAvailability,
  buildSession,
  buildVolunteer,
  getObjectId,
} from '../generate'
import {
  insertNotification,
  insertSession,
  insertSessionWithVolunteer,
  insertVolunteer,
  resetDb,
} from '../db-utils'
import { Session } from '../../models/Session'
import * as SessionRepo from '../../models/Session/queries'
import * as GetTimes from '../../utils/get-times'
jest.mock('../../models/Session/queries')
jest.mock('../../utils/get-times')

const mockedSessionRepo = mocked(SessionRepo, true)
const mockedTimeUtils = mocked(GetTimes, true)

const MOCK_MOMENT = moment.tz('2020-01-01T00:00:00', 'America/New_York') // Midnight EST
const MATCHING_AVAILABILITY = buildAvailability({ Wednesday: { '12a': true } })
const NON_MATCHING_AVAILABILITY = buildAvailability({
  Friday: { '12a': true },
})

mockedTimeUtils.getCurrentNewYorkTime.mockReturnValue(MOCK_MOMENT)

const SESSION = buildSession({
  _id: getObjectId(),
  type: 'college',
  subTopic: SAT_SUBJECTS.SAT_READING,
  addNotifications: jest.fn(),
})

jest.mock('twilio', () =>
  jest.fn(() => ({
    messages: {
      create: jest.fn(() => Promise.resolve({ sid: 'MM12345' })),
    },
  }))
)

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

afterAll(async () => {
  await mongoose.connection.close()
  jest.clearAllMocks()
})

beforeEach(async () => {
  await resetDb()
})

test('Properly builds a session URL', () => {
  const sessionUrl = TwilioService.getSessionUrl(SESSION)

  expect(sessionUrl).toEqual(
    `http://localhost/session/college/sat-reading/${SESSION._id}`
  )
})

test('Properly notifies a volunteer', async () => {
  const volunteer = await insertVolunteer(
    buildVolunteer({
      firstname: 'Austin',
      isApproved: true,
      availability: MATCHING_AVAILABILITY,
      subjects: [SAT_SUBJECTS.SAT_READING],
    })
  )

  mockedSessionRepo.getActiveSessionsWithVolunteers.mockImplementationOnce(
    async () => {
      const sessions: Session[] = []
      return sessions
    }
  )
  const notifiedVolunteerId = await TwilioService.notifyVolunteer(SESSION)

  expect(notifiedVolunteerId!).toEqual(volunteer._id)
})

test('Does nothing when no suitable volunteers are found', async () => {
  const volunteer = await insertVolunteer(
    buildVolunteer({
      isApproved: true,
      availability: NON_MATCHING_AVAILABILITY,
      subjects: [SAT_SUBJECTS.SAT_READING],
    })
  )

  mockedSessionRepo.getActiveSessionsWithVolunteers.mockImplementationOnce(
    async () => {
      const sessions: Session[] = []
      return sessions
    }
  )
  const notifiedVolunteerId = await TwilioService.notifyVolunteer(SESSION)

  expect(notifiedVolunteerId).toBeUndefined()
})

test('Does nothing when all volunteers are in an active session', async () => {
  const sessionOneVolunteer = await insertVolunteer(
    buildVolunteer({
      firstname: 'Austin',
      isApproved: true,
      availability: MATCHING_AVAILABILITY,
      subjects: [SAT_SUBJECTS.SAT_READING],
    })
  )
  const sessionTwoVolunteer = await insertVolunteer(
    buildVolunteer({
      firstname: 'Powers',
      isApproved: true,
      availability: MATCHING_AVAILABILITY,
      subjects: [SAT_SUBJECTS.SAT_READING],
    })
  )

  const session1 = await insertSessionWithVolunteer({
    volunteer: sessionOneVolunteer,
  })
  const session2 = await insertSessionWithVolunteer({
    volunteer: sessionTwoVolunteer,
  })

  mockedSessionRepo.getActiveSessionsWithVolunteers.mockImplementation(
    async (): Promise<Session[]> => {
      const sessions: Session[] = [session1.session, session2.session]
      return sessions
    }
  )

  const firstVolunteerId = await TwilioService.notifyVolunteer(SESSION)
  const secondVolunteerId = await TwilioService.notifyVolunteer(SESSION)

  mockedSessionRepo.getActiveSessionsWithVolunteers.mockClear()

  expect(firstVolunteerId).toBeUndefined()
  expect(secondVolunteerId).toBeUndefined()
})

test('Prioritizes partner volunteers', async () => {
  const volunteer = await insertVolunteer(
    buildVolunteer({
      firstname: 'Twilion',
      volunteerPartnerOrg: 'Twilio',
      isApproved: true,
      availability: MATCHING_AVAILABILITY,
      subjects: [SAT_SUBJECTS.SAT_READING],
    })
  )
  await insertVolunteer(
    buildVolunteer({
      firstname: 'Schmilion',
      isApproved: true,
      availability: MATCHING_AVAILABILITY,
      subjects: [SAT_SUBJECTS.SAT_READING],
    })
  )

  mockedSessionRepo.getActiveSessionsWithVolunteers.mockImplementationOnce(
    async () => {
      const sessions: Session[] = []
      return sessions
    }
  )

  const notifiedVolunteerId = await TwilioService.notifyVolunteer(SESSION)

  expect(notifiedVolunteerId!).toEqual(volunteer._id)
})

test('Prioritizes non-high-level SME volunteers for non-high-level subjects', async () => {
  const fiveDaysAgo = new Date(
    new Date().getTime() - 5 * 24 * 3600 * 1000
  ).toISOString()

  const einstein = await insertVolunteer(
    buildVolunteer({
      firstname: 'Einstein',
      isApproved: true,
      availability: MATCHING_AVAILABILITY,
      subjects: [SAT_SUBJECTS.SAT_READING, MATH_SUBJECTS.CALCULUS_AB],
    })
  )
  const hemingway = await insertVolunteer(
    buildVolunteer({
      firstname: 'Hemingway',
      isApproved: true,
      availability: MATCHING_AVAILABILITY,
      subjects: [SAT_SUBJECTS.SAT_READING],
    })
  )

  mockedSessionRepo.getActiveSessionsWithVolunteers.mockImplementationOnce(
    async () => {
      const sessions: Session[] = []
      return sessions
    }
  )

  await insertNotification(einstein, { sentAt: fiveDaysAgo })
  await insertNotification(hemingway, { sentAt: fiveDaysAgo })
  const notifiedVolunteerId = await TwilioService.notifyVolunteer(SESSION)

  expect(notifiedVolunteerId!).toEqual(hemingway._id)
})
