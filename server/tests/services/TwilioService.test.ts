test.todo('postgres migration')
/*import moment from 'moment'
import 'moment-timezone'
import mongoose from 'mongoose'
import { mocked } from 'jest-mock';
import * as TwilioService from '../../services/TwilioService'
import { MATH_SUBJECTS, SAT_SUBJECTS } from '../../constants'
import {
  buildAvailability,
  buildSession,
  buildStudent,
  buildVolunteer,
  getObjectId,
} from '../generate'
import {
  associatedPartnerManifests,
  sponsorOrgManifests,
} from '../../partnerManifests'
import { asObjectId } from '../../utils/type-utils'
import {
  insertNotification,
  insertSessionWithVolunteer,
  insertVolunteer,
  resetDb,
} from '../db-utils'
import { Session } from '../../models/Session'
import config from '../../config'
import * as SessionRepo from '../../models/Session/queries'
import * as StudentRepo from '../../models/Student/queries'
import * as GetTimes from '../../utils/get-times'
jest.mock('../../models/Session/queries')
jest.mock('../../models/Student/queries')
jest.mock('../../utils/get-times')

jest.setTimeout(10 * 1000)

const mockedSessionRepo = mocked(SessionRepo, true)
const mockedStudentRepo = mocked(StudentRepo, true)
const mockedTimeUtils = mocked(GetTimes, true)

const MOCK_MOMENT = moment.tz('2020-01-01T00:00:00', 'America/New_York') // Midnight EST
const MATCHING_AVAILABILITY = buildAvailability({ Wednesday: { '12a': true } })
const NON_MATCHING_AVAILABILITY = buildAvailability({
  Friday: { '12a': true },
})
const SAT_READING_DISPLAY = 'SAT Reading'

mockedTimeUtils.getCurrentNewYorkTime.mockReturnValue(MOCK_MOMENT)
mockedStudentRepo.getStudentById.mockResolvedValue(
  buildStudent({ studentPartnerOrg: '' })
)

const SESSION = buildSession({
  _id: getObjectId(),
  type: 'college',
  subTopic: SAT_SUBJECTS.SAT_READING,
  addNotifications: jest.fn(),
  student: getObjectId(),
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
    `http://${config.client.host}/session/college/sat-reading/${SESSION._id}`
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

describe('buildTargetStudentContent', () => {
  test('Should display message to a general student when there is no associated partner', () => {
    const associatedPartner = undefined
    const result = TwilioService.buildTargetStudentContent(
      buildVolunteer(),
      associatedPartner
    )
    const expected = `a student`

    expect(result).toEqual(expected)
  })

  test('Should format message to handle a student org that starts with a vowel', () => {
    const volunteerPartnerOrg = 'a'
    const volunteer = buildVolunteer({
      volunteerPartnerOrg,
    })
    const associatedPartner = {
      volunteerPartnerOrg,
      volunteerOrgDisplay: 'A',
      studentOrgDisplay: 'A Group',
    }
    const result = TwilioService.buildTargetStudentContent(
      volunteer,
      associatedPartner
    )
    const expected = `an ${associatedPartner.studentOrgDisplay} student`

    expect(result).toEqual(expected)
  })

  test('Should format message to handle when the student org is a consonant', () => {
    const volunteerPartnerOrg = 'b'
    const volunteer = buildVolunteer({
      volunteerPartnerOrg,
    })
    const associatedPartner = {
      volunteerPartnerOrg,
      volunteerOrgDisplay: 'B',
      studentOrgDisplay: 'B Group',
    }
    const result = TwilioService.buildTargetStudentContent(
      volunteer,
      associatedPartner
    )
    const expected = `a ${associatedPartner.studentOrgDisplay} student`

    expect(result).toEqual(expected)
  })
})

describe('buildNotificationContent', () => {
  test('Properly formatted message to a non-priority partner org volunteer', () => {
    const associatedPartner = undefined
    const volunteer = buildVolunteer()
    const result = TwilioService.buildNotificationContent(
      SESSION,
      volunteer,
      associatedPartner
    )
    const expected = `Hi ${volunteer.firstname}, a student needs help in ${SAT_READING_DISPLAY} on UPchieve! http://${config.client.host}/session/${SESSION.type}/sat-reading/${SESSION._id}`

    expect(result).toEqual(expected)
  })

  test('Properly formatted message to a priority partner org volunteer when a student partner org starting with a vowel', () => {
    const volunteerPartnerOrg = 'a'
    const volunteer = buildVolunteer({
      volunteerPartnerOrg,
    })
    const associatedPartner = {
      volunteerPartnerOrg,
      volunteerOrgDisplay: 'A',
      studentOrgDisplay: 'A Group',
    }
    const result = TwilioService.buildNotificationContent(
      SESSION,
      volunteer,
      associatedPartner
    )
    const expected = `Hi ${volunteer.firstname}, an ${associatedPartner.studentOrgDisplay} student needs help in ${SAT_READING_DISPLAY} on UPchieve! http://${config.client.host}/session/${SESSION.type}/sat-reading/${SESSION._id}`

    expect(result).toEqual(expected)
  })

  test('Properly formatted message to a priority partner org volunteer when a student partner org is a consonant', () => {
    const volunteerPartnerOrg = 'b'
    const volunteer = buildVolunteer({
      volunteerPartnerOrg,
    })
    const associatedPartner = {
      volunteerPartnerOrg,
      volunteerOrgDisplay: 'B',
      studentOrgDisplay: 'B Group',
    }
    const result = TwilioService.buildNotificationContent(
      SESSION,
      volunteer,
      associatedPartner
    )
    const expected = `Hi ${volunteer.firstname}, a ${associatedPartner.studentOrgDisplay} student needs help in ${SAT_READING_DISPLAY} on UPchieve! http://${config.client.host}/session/${SESSION.type}/sat-reading/${SESSION._id}`

    expect(result).toEqual(expected)
  })
})

describe('getAssociatedPartner', () => {
  test('Student does not have a matching priority partner org', () => {
    const result = TwilioService.getAssociatedPartner('', getObjectId())
    expect(result).toBeUndefined()
  })

  test('Student partner org should be associate with another partner org for priority matching', async () => {
    const studentPartnerOrg = 'example'
    const result = TwilioService.getAssociatedPartner(
      studentPartnerOrg,
      getObjectId()
    )
    const associatedPartner = associatedPartnerManifests[studentPartnerOrg]
    expect(result).toEqual(associatedPartner)
  })

  test('Student school should be associated with a sponsor org for priority matching', async () => {
    const schoolId = asObjectId(sponsorOrgManifests.sponsor.schools[0])
    const result = TwilioService.getAssociatedPartner('', schoolId)
    const associatedPartner = associatedPartnerManifests.sponsor
    expect(result).toEqual(associatedPartner)
  })

  test('Student partner org should be associated with a sponsor org for priority matching', async () => {
    const result = TwilioService.getAssociatedPartner(
      sponsorOrgManifests.sponsor2.partnerOrgs[1],
      getObjectId()
    )
    const associatedPartner = associatedPartnerManifests.sponsor2
    expect(result).toEqual(associatedPartner)
  })
})
*/
