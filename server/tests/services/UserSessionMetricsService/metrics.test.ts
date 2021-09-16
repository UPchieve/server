import {
  UpdateValueData,
  CounterMetricProcessor,
  ProcessorData
} from '../../../services/UserSessionMetricsService/types'
import { METRIC_PROCESSORS } from '../../../services/UserSessionMetricsService/metrics'
import { Counter } from '../../../models/UserSessionMetrics'
import { Session } from '../../../models/Session'
import { FeedbackVersionTwo } from '../../../models/Feedback'
import { Message } from '../../../models/Message'
import {
  buildVolunteer,
  buildStudent,
  buildFeedback,
  buildMessage,
  buildUSM,
  startSession,
  joinSession
} from '../../generate'
import { FEEDBACK_VERSIONS, USER_SESSION_METRICS } from '../../../constants'

jest.mock('../../../models/UserSessionMetrics', () => ({
  ...jest.requireActual('../../../models/UserSessionMetrics'),
  executeUpdatesByUserId: jest.fn().mockResolvedValue({})
}))

const student = buildStudent()
const volunteer = buildVolunteer()

function buildUpdateValueData(
  session: Session,
  feedback?: FeedbackVersionTwo
): UpdateValueData {
  return {
    session,
    feedback
  }
}

function sendMessage(session: Session, message: Message): void {
  session.messages.push(message)
}

describe('Metrics have correct "computeUpdateValue" functions', () => {
  test('Absent student', () => {
    const session = startSession(student)
    sendMessage(session, buildMessage({ user: student._id }))
    joinSession(session, volunteer)
    sendMessage(session, buildMessage({ user: volunteer._id }))

    const uvd = buildUpdateValueData(session)
    const processor = METRIC_PROCESSORS.AbsentStudent
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Absent volunteer', () => {
    const session = startSession(student)
    sendMessage(session, buildMessage({ user: student._id }))
    joinSession(session, volunteer)
    sendMessage(session, buildMessage({ user: student._id }))

    const uvd = buildUpdateValueData(session)
    const processor = METRIC_PROCESSORS.AbsentVolunteer
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Low coach rating from student (tutoring)', () => {
    const session = startSession(student)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.studentTutoringFeedback['coach-rating'] = 1

    const uvd = buildUpdateValueData(session, feedback)
    const processor = METRIC_PROCESSORS.LowCoachRatingFromStudent
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Low session rating from student (tutoring)', () => {
    const session = startSession(student)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.studentTutoringFeedback['session-goal'] = 1

    const uvd = buildUpdateValueData(session, feedback)
    const processor = METRIC_PROCESSORS.LowSessionRatingFromStudent
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Low coach rating from student (CC)', () => {
    const session = startSession(student)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.studentCounselingFeedback['coach-ratings']['coach-friendly'] = 1

    const uvd = buildUpdateValueData(session, feedback)
    const processor = METRIC_PROCESSORS.LowCoachRatingFromStudent
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Low session rating from student (CC)', () => {
    const session = startSession(student)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.studentCounselingFeedback['rate-session'].rating = 1

    const uvd = buildUpdateValueData(session, feedback)
    const processor = METRIC_PROCESSORS.LowSessionRatingFromStudent
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Low session rating from coach', () => {
    const session = startSession(student)
    joinSession(session, volunteer)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback['session-enjoyable'] = 1

    const uvd = buildUpdateValueData(session, feedback)
    const processor = METRIC_PROCESSORS.LowSessionRatingFromCoach
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Reported', () => {
    const session = startSession(student)
    session.isReported = true

    const uvd = buildUpdateValueData(session)
    const processor = METRIC_PROCESSORS.Reported
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Rude or inappropriate', () => {
    const session = startSession(student)
    joinSession(session, volunteer)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback['session-obstacles'] = [6]

    const uvd = buildUpdateValueData(session, feedback)
    const processor = METRIC_PROCESSORS.RudeOrInappropriate
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Only looking for answers', () => {
    const session = startSession(student)
    joinSession(session, volunteer)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback['session-obstacles'] = [7]

    const uvd = buildUpdateValueData(session, feedback)
    const processor = METRIC_PROCESSORS.OnlyLookingForAnswers
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Comment from student', () => {
    const session = startSession(student)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.studentTutoringFeedback['other-feedback'] = 'hello'

    const uvd = buildUpdateValueData(session, feedback)
    const processor = METRIC_PROCESSORS.CommentFromStudent
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Comment from volunteer', () => {
    const session = startSession(student)
    joinSession(session, volunteer)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback['other-feedback'] = 'hello'

    const uvd = buildUpdateValueData(session, feedback)
    const processor = METRIC_PROCESSORS.CommentFromVolunteer
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Has been unmatched', () => {
    const session = startSession(student)

    const uvd = buildUpdateValueData(session)
    const processor = METRIC_PROCESSORS.HasBeenUnmatched
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Has had technical issues', () => {
    const session = startSession(student)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback['session-obstacles'] = [0]

    const uvd = buildUpdateValueData(session, feedback)
    const processor = METRIC_PROCESSORS.HasHadTechnicalIssues
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })
})

describe('Counter metrics have correct "updateQuery" functions', () => {
  const session = startSession(student)
  joinSession(session, volunteer)

  const initialValue = 2
  const updateValue = 5

  class TestCounter extends CounterMetricProcessor {
    public key = USER_SESSION_METRICS.absentStudent
    public requiresFeedback = false

    public computeUpdateValue = () => updateValue
    public computeReviewReason = () => [] as USER_SESSION_METRICS[]
    public computeFlag = () => [] as USER_SESSION_METRICS[]
  }
  const processor = new TestCounter()

  test('Counter metric student query is correct', () => {
    const newUSM = buildUSM(student._id, { absentStudent: initialValue })
    const finalValue = processor.computeUpdateValue()
    const payload = {
      studentUSM: newUSM,
      value: finalValue
    } as ProcessorData<Counter>

    expect(processor.computeStudentUpdateQuery(payload)).toEqual({
      'counters.absentStudent': updateValue + initialValue
    })
  })

  test('Counter metric volunteer update query is correrct', () => {
    const newUSM = buildUSM(student._id, { absentStudent: initialValue })
    const otherUSM = buildUSM(volunteer._id, { absentStudent: initialValue })
    const finalValue = processor.computeUpdateValue()
    const payload = {
      studentUSM: newUSM,
      volunteerUSM: otherUSM,
      value: finalValue
    } as ProcessorData<Counter>

    expect(processor.computeVolunteerUpdateQuery(payload)).toEqual({
      'counters.absentStudent': updateValue + initialValue
    })
  })
})
