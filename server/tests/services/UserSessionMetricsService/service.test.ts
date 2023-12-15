test.todo('postgres migration')
/*import { CounterMetricProcessor } from '../../../services/UserSessionMetricsService/types'
import * as USMService from '../../../services/UserSessionMetricsService'

import { Session } from '../../../models/Session'
import { FeedbackVersionTwo } from '../../../models/Feedback'
import {
  buildVolunteer,
  buildStudent,
  buildFeedback,
  buildUSM,
  startSession,
  joinSession,
} from '../../generate'
import { FEEDBACK_VERSIONS, USER_SESSION_METRICS } from '../../../constants'
import logger from '../../../logger'

// Test data
const student = buildStudent()
const studentUSM = buildUSM(student._id)
const volunteer = buildVolunteer()
const volunteerUSM = buildUSM(volunteer._id)

const feedback = buildFeedback({
  versionNumber: FEEDBACK_VERSIONS.TWO,
}) as FeedbackVersionTwo

const counterError = new Error('test')
class ErrorCounter extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.absentVolunteer
  public requiresFeedback = false

  public computeUpdateValue = () => {
    throw counterError
  }
  public computeReviewReason = () => [] as USER_SESSION_METRICS[]
  public computeFlag = () => {
    throw counterError
  }
  public triggerActions = () => {
    return [] as Promise<void>[]
  }
}
const errorProcessor = new ErrorCounter()

const updateValue = 5
class TestCounter extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.absentStudent
  public requiresFeedback = false

  public computeUpdateValue = () => updateValue
  public computeReviewReason = () => [] as USER_SESSION_METRICS[]
  public computeFlag = () => [USER_SESSION_METRICS.absentStudent]
  public triggerActions = () => {
    return [] as Promise<void>[]
  }
}
const testProcessor = new TestCounter()
const testMetrics = [testProcessor, errorProcessor]

describe('Prepare metrics', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Logs errors from failed metric constructors', async () => {
    const session = startSession(student)

    const expected = {
      studentUSM,
      session,
      outputs: {
        TestCounter: updateValue,
      },
    } as USMService.MetricProcessorPayload
    await expect(
      USMService.prepareMetrics(testMetrics, session, studentUSM, feedback)
    ).resolves.toEqual(expected)
    expect(logger.error).toHaveBeenCalledWith(
      `Metrics processor ${errorProcessor.constructor.name} failed to compute update value`
    )
  })

  test('Builds ProcessorPayload for a matched session without feedback', async () => {
    const session = startSession(student)
    joinSession(session, volunteer)

    const expected = {
      studentUSM,
      volunteerUSM,
      session,
      outputs: {
        TestCounter: updateValue,
      },
    } as USMService.MetricProcessorPayload
    await expect(
      USMService.prepareMetrics(
        testMetrics,
        session,
        studentUSM,
        feedback,
        volunteerUSM
      )
    ).resolves.toEqual(expected)
  })

  test('Builds ProcessorData for a unmatched session without feedback', async () => {
    const session = startSession(student)

    const expected = {
      studentUSM,
      session,
      outputs: {
        TestCounter: updateValue,
      },
    } as USMService.MetricProcessorPayload
    await expect(
      USMService.prepareMetrics(testMetrics, session, studentUSM, feedback)
    ).resolves.toEqual(expected)
    expect(logger.error).toHaveBeenCalledWith(
      `Metrics processor ${errorProcessor.constructor.name} failed to compute update value`
    )
  })

  test('Builds UpdateValueData for a session with feedback', async () => {
    const session = startSession(student)

    const expected = {
      studentUSM,
      session,
      outputs: {
        TestCounter: updateValue,
      },
    } as USMService.MetricProcessorPayload
    await expect(
      USMService.prepareMetrics(testMetrics, session, studentUSM, feedback)
    ).resolves.toEqual(expected)
    expect(logger.error).toHaveBeenCalledWith(
      `Metrics processor ${errorProcessor.constructor.name} failed to compute update value`
    )
  })
})

describe('Metric processor factory', () => {
  const testProcessorFunction = USMService.metricProcessorFactory(
    {
      [TestCounter.name]: testProcessor,
      [ErrorCounter.name]: errorProcessor,
    },
    'computeFlag',
    (acc: USER_SESSION_METRICS[]): USER_SESSION_METRICS[] => acc.flat(),
    async (flags: USER_SESSION_METRICS[], session: Session): Promise<void> => {
      logger.info(flags)
      logger.info(session)
    }
  )
  const session = startSession(student)
  const payload = {
    session,
    studentUSM,
    outputs: {
      [TestCounter.name]: updateValue,
      [ErrorCounter.name]: 0,
    },
  } as USMService.MetricProcessorPayload

  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('Successfully computes factory function output', async () => {
    const errMsg = `errors processing computeFlag:\nErrorCounter.computeFlag(): ${counterError.message}`
    await expect(testProcessorFunction(payload)).rejects.toThrowError(errMsg)

    expect(logger.info).toHaveBeenNthCalledWith(1, [
      USER_SESSION_METRICS.absentStudent,
    ])
    expect(logger.info).toHaveBeenNthCalledWith(2, session)
  })
})
*/
