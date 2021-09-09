import { mocked } from 'ts-jest/utils'

import {
  MetricData,
  CounterMetricClass
} from '../../../services/UserSessionMetricsService/metric-types'
import * as USMService from '../../../services/UserSessionMetricsService'

import * as USMRepo from '../../../models/UserSessionMetrics'
import * as SessionRepo from '../../../models/Session'
import * as FeedbackRepo from '../../../models/Feedback'
import {
  buildVolunteer,
  buildStudent,
  buildFeedback,
  buildUSM,
  startSession,
  joinSession
} from '../../generate'
import { FEEDBACK_VERSIONS, USER_SESSION_METRICS } from '../../../constants'
import logger from '../../../logger'

jest.mock('../../../logger')
jest.mock('../../../models/Session')
const mockedSessionRepo = mocked(SessionRepo)
jest.mock('../../../models/UserSessionMetrics')
const mockedUSMRepo = mocked(USMRepo)
jest.mock('../../../models/Feedback')
const mockedFeedbackRepo = mocked(FeedbackRepo)

describe('Build MetricData', () => {
  const student = buildStudent()
  const studentUSM = buildUSM(student._id)
  const volunteer = buildVolunteer()
  const volunteerUSM = buildUSM(volunteer._id)

  const feedback = buildFeedback({
    versionNumber: FEEDBACK_VERSIONS.TWO
  }) as FeedbackRepo.FeedbackVersionTwo

  beforeAll(() => {
    jest.resetAllMocks()
  })

  afterAll(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  test('Builds MetricData for a matched session without feedback', async () => {
    mockedUSMRepo.getByUserId.mockResolvedValueOnce(studentUSM)
    mockedUSMRepo.getByUserId.mockResolvedValueOnce(volunteerUSM)
    mockedFeedbackRepo.getFeedbackBySessionId.mockResolvedValueOnce(undefined)

    const session = startSession(student)
    joinSession(session, volunteer)
    const expected = {
      studentUSM,
      volunteerUSM,
      session
    } as MetricData
    await expect(USMService.buildMetricData(session)).resolves.toEqual(expected)
  })
  test('Builds MetricData for a unmatched session without feedback', async () => {
    mockedUSMRepo.getByUserId.mockResolvedValueOnce(studentUSM)
    mockedFeedbackRepo.getFeedbackBySessionId.mockResolvedValueOnce(undefined)

    const session = startSession(student)
    const expected = {
      studentUSM,
      session
    } as MetricData
    await expect(USMService.buildMetricData(session)).resolves.toEqual(expected)
  })
  test('Builds MetricData for a matched session with feedback', async () => {
    mockedUSMRepo.getByUserId.mockResolvedValueOnce(studentUSM)
    mockedUSMRepo.getByUserId.mockResolvedValueOnce(volunteerUSM)
    mockedFeedbackRepo.getFeedbackBySessionId.mockResolvedValueOnce(feedback)

    const session = startSession(student)
    joinSession(session, volunteer)
    const expected = {
      studentUSM,
      volunteerUSM,
      session,
      feedback
    } as MetricData
    await expect(USMService.buildMetricData(session)).resolves.toEqual(expected)
  })
  test('Bubbles up errors from failed get USM', async () => {
    const testError = new Error('test')
    mockedUSMRepo.getByUserId.mockRejectedValueOnce(testError)

    const session = startSession(student)

    await expect(USMService.buildMetricData(session)).rejects.toEqual(testError)
  })
  test('Bubbles up errors from failed get Feedback', async () => {
    mockedUSMRepo.getByUserId.mockResolvedValueOnce(studentUSM)
    const testError = new Error('test')
    mockedFeedbackRepo.getFeedbackBySessionId.mockRejectedValueOnce(testError)

    const session = startSession(student)

    await expect(USMService.buildMetricData(session)).rejects.toEqual(testError)
  })
})

describe('Prepare metrics', () => {
  const student = buildStudent()
  const studentUSM = buildUSM(student._id)

  const session = startSession(student)
  const feedback = buildFeedback({
    versionNumber: FEEDBACK_VERSIONS.TWO
  }) as FeedbackRepo.FeedbackVersionTwo

  class ErrorCounter extends CounterMetricClass {
    public key = USER_SESSION_METRICS.absentVolunteer

    constructor(md: MetricData) {
      super(md)
      throw new Error()
    }

    public computeUpdateValue = () => 0
    public reviewReason = () => [] as USER_SESSION_METRICS[]
    public flag = () => [] as USER_SESSION_METRICS[]
  }
  class TestCounter extends CounterMetricClass {
    public key = USER_SESSION_METRICS.absentStudent

    constructor(md: MetricData) {
      super(md)
      this.setup()
    }

    public computeUpdateValue = () => 0
    public reviewReason = () => [] as USER_SESSION_METRICS[]
    public flag = () => [] as USER_SESSION_METRICS[]
  }
  const testMetrics = [TestCounter, ErrorCounter]

  beforeAll(() => {
    jest.resetAllMocks()

    mockedSessionRepo.getSessionById.mockResolvedValue(session)
    mockedUSMRepo.getByUserId.mockResolvedValue(studentUSM)
    mockedFeedbackRepo.getFeedbackBySessionId.mockResolvedValue(feedback)
  })

  afterAll(() => {
    jest.resetAllMocks()
    jest.restoreAllMocks()
  })

  test('Bubbles up errors from building MetricData', async () => {
    const testError = new Error('test')
    mockedUSMRepo.getByUserId.mockRejectedValueOnce(testError)

    await expect(
      USMService.prepareMetrics(testMetrics, session._id)
    ).rejects.toEqual(testError)
  })

  test('Logs errors from failed metric constructors', async () => {
  
    await USMService.prepareMetrics(testMetrics, session._id)
    expect(logger.error).toHaveBeenCalled()
  })
})

// TODO: test metricProcessorFactory
