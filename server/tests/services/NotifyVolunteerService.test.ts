import { mocked } from 'jest-mock'
import logger from '../../logger'
import * as StudentRepo from '../../models/Student'
import * as SessionRepo from '../../models/Session'
import * as VolunteerRepo from '../../models/Volunteer'
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

jest.mock('../../models/Volunteer')
jest.mock('../../models/Student')
jest.mock('../../models/Session')
jest.mock('../../clients/twilio')
jest.mock('../../services/QueueService')
jest.mock('../../services/AnalyticsService')
jest.mock('../../logger')

const mockedVolunteerRepo = mocked(VolunteerRepo)
const mockedStudentRepo = mocked(StudentRepo)
const mockedSessionRepo = mocked(SessionRepo)
const mockedQueueService = mocked(QueueService)
const mockedLogger = mocked(logger)
const mockedSendTextMessage = mocked(sendTextMessage)

describe('notifyRequestedVolunteer', () => {
  beforeEach(() => {
    jest.resetAllMocks()
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

  test('sends SMS when the volunteer has opted in', async () => {
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
