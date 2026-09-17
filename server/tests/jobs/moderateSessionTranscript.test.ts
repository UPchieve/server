import { Job } from 'bull'
import { getUuid } from '../../models/pgUtils'
import * as ModerationService from '../../services/ModerationService'
import * as SessionService from '../../services/SessionService'
import * as VisionService from '../../services/VisionService'
import * as WhiteboardService from '../../services/WhiteboardService'
import { fetchRemoteJs } from '../../utils/fetch-remote-js'
import { importFromStringSync } from 'module-from-string'
import { client as langfuseClient } from '../../clients/langfuse'
import moderateSessionTranscript, {
  ModerateSessionTranscriptJobData,
} from '../../worker/jobs/moderate-session-transcript'
import { LiveMediaModerationCategories } from '../../services/ModerationService/types'
import { UserSessionFlags } from '../../constants'

jest.mock('../../logger')
jest.mock('../../services/ModerationService')
jest.mock('../../services/SessionService')
jest.mock('../../services/VisionService')
jest.mock('../../services/WhiteboardService')
jest.mock('../../utils/fetch-remote-js')
jest.mock('module-from-string')
jest.mock('../../clients/langfuse')

const mockedModerationService = jest.mocked(ModerationService)
const mockedSessionService = jest.mocked(SessionService)
const mockedVisionService = jest.mocked(VisionService)
const mockedWhiteboardService = jest.mocked(WhiteboardService)

const sessionId = getUuid()
const job = { data: { sessionId } } as Job<ModerateSessionTranscriptJobData>

beforeEach(() => {
  jest.resetAllMocks()

  jest.mocked(langfuseClient).trace.mockReturnValue({} as never)
  jest.mocked(fetchRemoteJs).mockResolvedValue('')
  jest.mocked(importFromStringSync).mockReturnValue({
    Zwibbler: { save: jest.fn().mockReturnValue('whiteboard-image') },
  })

  mockedWhiteboardService.getDocFromStorage.mockResolvedValue('a-doc')
  mockedSessionService.getSessionTranscript.mockResolvedValue({
    messages: [],
  } as never)
  mockedVisionService.extractTextFromImage.mockResolvedValue([])
  mockedModerationService.moderateImage.mockResolvedValue({
    failures: [],
  } as never)
  mockedModerationService.moderateTranscript.mockResolvedValue([])
})

describe('moderateSessionTranscript', () => {
  it('moderates the transcript and flags the session even when whiteboard image moderation throws', async () => {
    mockedModerationService.moderateImage.mockRejectedValue(
      new TypeError('result.infractions.filter is not a function')
    )
    mockedModerationService.moderateTranscript.mockResolvedValue([
      {
        reason: LiveMediaModerationCategories.LINK,
        message: 'we can meet offline',
        confidence: 0.95,
      },
    ])
    mockedModerationService.getSessionFlagByModerationReason.mockReturnValue(
      UserSessionFlags.platformCircumvention
    )

    await expect(moderateSessionTranscript(job)).rejects.toThrow()

    expect(mockedModerationService.moderateTranscript).toHaveBeenCalled()
    expect(mockedSessionService.markSessionForReview).toHaveBeenCalledWith(
      sessionId,
      [UserSessionFlags.platformCircumvention]
    )
  })

  it('moderates the transcript when whiteboard text extraction throws', async () => {
    mockedVisionService.extractTextFromImage.mockRejectedValue(
      new Error('vision is down')
    )

    await expect(moderateSessionTranscript(job)).rejects.toThrow()

    expect(mockedModerationService.moderateTranscript).toHaveBeenCalled()
  })

  it('still fails the job when the whiteboard step rejects without a reason', async () => {
    mockedModerationService.moderateImage.mockRejectedValue(undefined)

    await expect(moderateSessionTranscript(job)).rejects.toThrow()
  })

  it('does not throw when both whiteboard steps succeed', async () => {
    await expect(moderateSessionTranscript(job)).resolves.toBeUndefined()

    expect(mockedModerationService.moderateTranscript).toHaveBeenCalled()
  })
})
