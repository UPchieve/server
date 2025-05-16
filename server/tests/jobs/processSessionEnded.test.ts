import { Job } from 'bull'
import { Jobs } from '../../worker/jobs'
import { getUuid } from '../../models/pgUtils'
import * as ProgressReportsService from '../../services/ProgressReportsService'
import * as IncentiveProgramService from '../../services/IncentiveProgramService'
import * as SessionService from '../../services/SessionService'
import * as SessionFlagsService from '../../services/SessionFlagsService'
import * as SessionSummariesService from '../../services/SessionSummariesService'
import processSessionEnded from '../../worker/jobs/processSessionEnded'

jest.mock('../../services/SessionService')
jest.mock('../../services/SessionFlagsService')
jest.mock('../../services/SessionSummariesService')
jest.mock('../../services/ProgressReportsService')
jest.mock('../../services/IncentiveProgramService')

const mockedSessionService = jest.mocked(SessionService)
const mockedSessionFlagsService = jest.mocked(SessionFlagsService)
const mockedSessionSummariesService = jest.mocked(SessionSummariesService)
const mockedProgressReportsService = jest.mocked(ProgressReportsService)
const mockedIncentiveProgramService = jest.mocked(IncentiveProgramService)

describe('processSessionEnded', () => {
  const sessionId = getUuid()
  const job = {
    data: { sessionId },
    name: Jobs.ProcessSessionEnded,
  } as Job<{ sessionId: string }>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should call all session processing services in correct order', async () => {
    await processSessionEnded(job)

    // Only enforce call order between strictly sequential steps
    const orderedSteps = [
      mockedSessionFlagsService.processSessionMetrics,
      mockedSessionService.processCalculateMetrics,
    ]

    let previousStepCallOrder = -1
    for (const step of orderedSteps) {
      const currentStepCallOrder = step.mock.invocationCallOrder[0]
      expect(currentStepCallOrder).toBeGreaterThan(previousStepCallOrder)
      previousStepCallOrder = currentStepCallOrder
      expect(step).toHaveBeenCalledWith(sessionId)
      expect(step).toHaveBeenCalledTimes(1)
    }

    expect(
      mockedSessionSummariesService.queueGenerateSessionSummaryForSession
    ).toHaveBeenCalledWith(sessionId)
    expect(mockedSessionService.processEmailVolunteer).toHaveBeenCalledWith(
      sessionId
    )
    expect(
      mockedSessionService.processFirstSessionCongratsEmail
    ).toHaveBeenCalledWith(sessionId)
    expect(
      mockedProgressReportsService.queueGenerateProgressReportForUser
    ).toHaveBeenCalledWith(sessionId)
    expect(
      mockedIncentiveProgramService.queueFallIncentiveSessionQualificationJob
    ).toHaveBeenCalledWith(sessionId)
    expect(mockedSessionService.processSessionReported).toHaveBeenCalledWith(
      sessionId
    )
    expect(mockedSessionService.processSessionEditors).toHaveBeenCalledWith(
      sessionId
    )
    expect(mockedSessionService.processSessionTranscript).toHaveBeenCalledWith(
      sessionId
    )
  })

  test('should throw an error if one of the services fails', async () => {
    const errorMessage = 'Service failed'
    mockedSessionFlagsService.processSessionMetrics.mockRejectedValueOnce(
      new Error(errorMessage)
    )

    await expect(processSessionEnded(job)).rejects.toThrow(
      `Failed to complete ${Jobs.ProcessSessionEnded} for session ${sessionId}: Error: ${errorMessage}`
    )
  })
})
