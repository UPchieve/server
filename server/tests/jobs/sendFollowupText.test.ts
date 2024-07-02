test.todo('postgres migration')
/*import { mocked } from 'jest-mock';
import * as SessionRepo from '../../models/Session/queries'
import * as VolunteerRepo from '../../models/Volunteer/queries'
import * as TwilioService from '../../services/TwilioService'
import * as SessionUtils from '../../utils/session-utils'
import { Jobs } from '../../worker/jobs'
import sendFollowupText from '../../worker/jobs/sendFollowupText'
import { log } from '../../worker/logger'
import { buildSession, buildVolunteer } from '../generate'
jest.mock('../../services/TwilioService')
jest.mock('../../services/QueueService')
jest.mock('../../models/Volunteer/queries')
jest.mock('../../models/Session/queries')
jest.mock('../../utils/session-utils.ts')
jest.mock('../../worker/logger')

const mockedTwilioService = mocked(TwilioService, true)
const mockedSessionRepo = mocked(SessionRepo, true)
const mockedVolunteerRepo = mocked(VolunteerRepo, true)
const mockedSessionUtils = mocked(SessionUtils, true)

describe('sendFollowupText', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
  })

  test('Should not send followup text to a volunteer if session is fulfilled', async () => {
    const session = buildSession()
    const volunteer = buildVolunteer()
    mockedSessionRepo.getSessionById.mockResolvedValueOnce(session)
    mockedVolunteerRepo.getVolunteerContactInfoById.mockResolvedValueOnce(
      volunteer
    )
    mockedSessionUtils.isSessionFulfilled.mockReturnValueOnce(true)

    // @todo: figure out how to properly type
    const job: any = {
      data: {
        sessionId: session._id.toString(),
        volunteerId: volunteer._id.toString(),
      },
    }

    await sendFollowupText(job)
    expect(log).toHaveBeenCalledWith(
      `Cancel ${Jobs.SendFollowupText} for ${session._id} to ${volunteer._id}: fulfilled`
    )
  })

  test('Should capture error when sending followup text', async () => {
    const session = buildSession()
    const volunteer = buildVolunteer()
    mockedSessionRepo.getSessionById.mockResolvedValueOnce(session)
    mockedVolunteerRepo.getVolunteerContactInfoById.mockResolvedValueOnce(
      volunteer
    )
    mockedSessionUtils.isSessionFulfilled.mockReturnValueOnce(false)
    const errMsg = 'test'
    mockedTwilioService.sendFollowupText.mockRejectedValueOnce(errMsg)

    // @todo: figure out how to properly type
    const job: any = {
      data: {
        sessionId: session._id.toString(),
        volunteerId: volunteer._id.toString(),
      },
    }

    await expect(sendFollowupText(job)).rejects.toEqual(
      Error(
        `Failed to send followup for session ${session._id} to volunteer ${volunteer._id}: ${errMsg}`
      )
    )
  })

  test('Should send followup text to volunteer', async () => {
    const session = buildSession()
    const volunteer = buildVolunteer()
    mockedSessionRepo.getSessionById.mockResolvedValueOnce(session)
    mockedVolunteerRepo.getVolunteerContactInfoById.mockResolvedValueOnce(
      volunteer
    )
    mockedSessionUtils.isSessionFulfilled.mockReturnValueOnce(false)
    mockedTwilioService.sendFollowupText.mockResolvedValueOnce()

    // @todo: figure out how to properly type
    const job: any = {
      data: {
        sessionId: session._id.toString(),
        volunteerId: volunteer._id.toString(),
      },
    }

    await sendFollowupText(job)
    expect(log).toHaveBeenCalledWith(
      `Successfully sent followup for session ${session._id} to volunteer ${volunteer._id}`
    )
  })
})
*/
