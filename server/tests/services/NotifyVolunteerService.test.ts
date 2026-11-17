import { mocked } from 'jest-mock'
import logger from '../../logger'
import * as AvailabilityRepo from '../../models/Availability'
import * as StudentRepo from '../../models/Student'
import * as SessionRepo from '../../models/Session'
import * as VolunteerRepo from '../../models/Volunteer'
import createNewAvailability from '../../utils/create-new-availability'
import { sendTextMessage } from '../../clients/twilio'
import QueueService from '../../services/QueueService'
import {
  beginRegularNotifications,
  notifyRequestedVolunteer,
} from '../../services/NotifyVolunteerService'
import {
  buildCurrentSession,
  buildUserContactInfo,
  buildVolunteerContactInfo,
} from '../mocks/generate'
import { getDbUlid } from '../../models/pgUtils'

jest.mock('../../models/Availability')
jest.mock('../../models/Volunteer')
jest.mock('../../models/Student')
jest.mock('../../models/Session')
jest.mock('../../clients/twilio')
jest.mock('../../services/QueueService')
jest.mock('../../services/AnalyticsService')
jest.mock('../../logger')

const mockedAvailabilityRepo = mocked(AvailabilityRepo)
const mockedVolunteerRepo = mocked(VolunteerRepo)
const mockedStudentRepo = mocked(StudentRepo)
const mockedSessionRepo = mocked(SessionRepo)
const mockedQueueService = mocked(QueueService)
const mockedLogger = mocked(logger)
const mockedSendTextMessage = mocked(sendTextMessage)

describe('notifyRequestedVolunteer', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-11-17T20:30:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('does not send SMS when the volunteer has opted out', async () => {
    const session = buildCurrentSession()
    const volunteer = buildVolunteerContactInfo({
      phone: '5555555555',
      smsConsent: false,
    })
    mockedVolunteerRepo.getVolunteerContactInfoById.mockResolvedValueOnce(
      volunteer
    )

    await notifyRequestedVolunteer(session, volunteer.id)
    expect(mockedSendTextMessage).not.toHaveBeenCalled()
    expect(mockedSessionRepo.addSessionNotification).not.toHaveBeenCalled()
    expect(mockedLogger.info).toHaveBeenCalledWith(
      'Skipping requested-tutor SMS: volunteer has not consented',
      { sessionId: session.id, volunteerId: volunteer.id }
    )
  })

  test('sends SMS when text messaging is enabled and no availability is set', async () => {
    mockedAvailabilityRepo.getAvailabilityForVolunteer.mockResolvedValue(
      createNewAvailability()
    )

    const session = buildCurrentSession()
    const volunteer = buildVolunteerContactInfo({
      phone: '5555555555',
      smsConsent: true,
    })
    const messageId = getDbUlid()
    mockedVolunteerRepo.getVolunteerContactInfoById.mockResolvedValueOnce(
      volunteer
    )
    mockedSendTextMessage.mockResolvedValueOnce(messageId)

    await notifyRequestedVolunteer(session, volunteer.id)
    expect(mockedSendTextMessage).toHaveBeenCalledWith(
      volunteer.phone,
      expect.any(String),
      session.id
    )
    expect(mockedSessionRepo.addSessionNotification).toHaveBeenCalledWith(
      session.id,
      expect.objectContaining({
        volunteer: volunteer.id,
        messageId,
        wasSuccessful: true,
      })
    )
  })

  test('sends SMS during the selected availability hour', async () => {
    const availability = createNewAvailability()
    availability.Tuesday['3p'] = true
    mockedVolunteerRepo.getVolunteerContactInfoById.mockResolvedValue(
      buildVolunteerContactInfo({ phone: '5555555555', smsConsent: true })
    )
    mockedAvailabilityRepo.getAvailabilityForVolunteer.mockResolvedValue(
      availability
    )

    await notifyRequestedVolunteer(buildCurrentSession(), getDbUlid())
    expect(mockedSendTextMessage).toHaveBeenCalledTimes(1)
  })

  test('does not send SMS outside the selected hours', async () => {
    const availability = createNewAvailability()
    availability.Tuesday['4p'] = true
    mockedVolunteerRepo.getVolunteerContactInfoById.mockResolvedValue(
      buildVolunteerContactInfo({ phone: '5555555555', smsConsent: true })
    )
    mockedAvailabilityRepo.getAvailabilityForVolunteer.mockResolvedValue(
      availability
    )

    await notifyRequestedVolunteer(buildCurrentSession(), getDbUlid())
    expect(mockedSendTextMessage).not.toHaveBeenCalled()
    expect(mockedSessionRepo.addSessionNotification).not.toHaveBeenCalled()
  })

  test('uses the New York weekday when UTC is already on the next day', async () => {
    jest.setSystemTime(new Date('2026-11-16T04:30:00Z'))
    const availability = createNewAvailability()
    availability.Sunday['11p'] = true

    mockedVolunteerRepo.getVolunteerContactInfoById.mockResolvedValue(
      buildVolunteerContactInfo({ phone: '5555555555', smsConsent: true })
    )
    mockedAvailabilityRepo.getAvailabilityForVolunteer.mockResolvedValue(
      availability
    )

    await notifyRequestedVolunteer(buildCurrentSession(), getDbUlid())
    expect(mockedSendTextMessage).toHaveBeenCalledTimes(1)
  })

  test('does not fail the request when the availability check fails', async () => {
    mockedVolunteerRepo.getVolunteerContactInfoById.mockResolvedValue(
      buildVolunteerContactInfo({ phone: '5555555555', smsConsent: true })
    )
    mockedAvailabilityRepo.getAvailabilityForVolunteer.mockRejectedValue(
      new Error('Database unavailable')
    )

    await expect(
      notifyRequestedVolunteer(buildCurrentSession(), getDbUlid())
    ).resolves.toBeUndefined()
    expect(mockedSendTextMessage).not.toHaveBeenCalled()
    expect(mockedLogger.error).toHaveBeenCalledWith(
      'Failed to check requested-tutor SMS eligibility',
      expect.objectContaining({ err: expect.any(Error) })
    )
  })
})

describe('beginRegularNotifications', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('queues notifications with a 30-second delay by default', async () => {
    const session = buildCurrentSession()
    mockedStudentRepo.getStudentContactInfoById.mockResolvedValueOnce(
      buildUserContactInfo({ id: session.studentId })
    )

    await beginRegularNotifications(session)
    expect(mockedQueueService.add).toHaveBeenCalledWith(
      'TextVolunteers',
      { delay: 30000, jobId: `TextVolunteers:${session.id}` },
      expect.objectContaining({ sessionId: session.id })
    )
  })

  test('queues notifications immediately', async () => {
    const session = buildCurrentSession()
    mockedStudentRepo.getStudentContactInfoById.mockResolvedValueOnce(
      buildUserContactInfo({ id: session.studentId })
    )

    await beginRegularNotifications(session, 0)
    expect(mockedQueueService.add).toHaveBeenCalledWith(
      'TextVolunteers',
      { delay: 0, jobId: `TextVolunteers:${session.id}` },
      expect.objectContaining({ sessionId: session.id })
    )
  })
})
