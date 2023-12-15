test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import notifyTutors from '../../worker/jobs/notifyTutors'
import config from '../../config'
import * as TwilioService from '../../services/TwilioService'
import * as SessionRepo from '../../models/Session/queries'
import * as SessionUtils from '../../utils/session-utils'
import { buildSession, buildVolunteer } from '../generate'
import { Jobs } from '../../worker/jobs'
import { log } from '../../worker/logger'
import QueueService from '../../services/QueueService'
jest.mock('../../services/TwilioService')
jest.mock('../../services/QueueService')
jest.mock('../../models/Session/queries')
jest.mock('../../utils/session-utils.ts')
jest.mock('../../worker/logger')

jest.setTimeout(15000)

const mockedTwilioService = mocked(TwilioService, true)
const mockedSessionRepo = mocked(SessionRepo, true)
const mockedSessionUtils = mocked(SessionUtils, true)

describe('Notify tutors', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should not notify volunteers when session is fulfilled', async () => {
    const session = buildSession()
    mockedSessionRepo.getSessionById.mockResolvedValueOnce(session)
    mockedSessionUtils.isSessionFulfilled.mockReturnValueOnce(true)
    // @todo: figure out how to properly type

    const job: any = {
      data: {
        sessionId: session._id,
        notificationSchedule: config.notificationSchedule,
      },
    }

    await notifyTutors(job)
    expect(log).toHaveBeenCalledWith(
      `Cancel ${Jobs.NotifyTutors} for ${session._id}: fulfilled`
    )
    expect(QueueService.add).toHaveBeenCalledTimes(1)
  })

  test('Should not notify volunteers when notification schedule is empty', async () => {
    const session = buildSession()
    mockedSessionRepo.getSessionById.mockResolvedValueOnce(session)
    mockedSessionUtils.isSessionFulfilled.mockReturnValueOnce(false)
    // @todo: figure out how to properly type

    const job: any = {
      data: {
        sessionId: session._id,
        notificationSchedule: [],
      },
      queue: {
        add: jest.fn(),
      },
    }

    mockedTwilioService.notifyVolunteer.mockResolvedValueOnce(undefined)

    await notifyTutors(job)

    expect(job.queue.add).toHaveBeenCalledTimes(0)
    expect(log).toHaveBeenCalledWith(
      `Unable to send notification for session ${session._id}: no volunteers available`
    )
  })

  test('Should notify volunteers and queue sending a followup text', async () => {
    const session = buildSession()
    mockedSessionRepo.getSessionById.mockResolvedValueOnce(session)
    mockedSessionUtils.isSessionFulfilled.mockReturnValueOnce(false)
    // @todo: figure out how to properly type

    const job: any = {
      data: {
        sessionId: session._id,
        notificationSchedule: [1000, 1000],
      },
    }
    const volunteer = buildVolunteer()

    mockedTwilioService.notifyVolunteer.mockResolvedValueOnce(volunteer._id)
    await notifyTutors(job)

    expect(QueueService.add).toHaveBeenCalledWith(
      Jobs.NotifyTutors,
      {
        sessionId: session._id.toString(),
        notificationSchedule: job.data.notificationSchedule,
      },
      expect.anything()
    )
    expect(QueueService.add).toHaveBeenCalledWith(
      Jobs.SendFollowupText,
      {
        sessionId: session._id.toString(),
        volunteerId: volunteer._id.toString(),
      },
      {
        delay: 1000 * 60 * 5,
      }
    )
    expect(job.data.notificationSchedule.length).toBe(1)
    expect(log).toHaveBeenCalledWith(
      `Successfully sent notification for session ${session._id} to volunteer ${volunteer._id}`
    )
  })
})
*/
