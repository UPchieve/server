import { Types } from 'mongoose'

import * as METRICS from '../../../services/UserSessionMetricsService/Metrics'
import { Session, updateFlags } from '../../../models/Session'
import { incrementCounterByUserId } from '../../../models/UserSessionMetrics'
import { FeedbackVersionTwo } from '../../../models/Feedback'
import { Message } from '../../../models/Message'
import {
  buildSession,
  buildVolunteer,
  buildStudent,
  buildFeedback,
  buildMessage
} from '../../generate'
import { FEEDBACK_VERSIONS } from '../../../constants'

jest.mock('../../../models/UserSessionMetrics', () => ({
  ...jest.requireActual('../../../models/UserSessionMetrics'),
  incrementCounterByUserId: jest.fn().mockResolvedValue({})
}))
jest.mock('../../../models/Session', () => ({
  ...jest.requireActual('../../../models/Session'),
  updateFlags: jest.fn().mockResolvedValue({})
}))

const student = buildStudent()
const volunteer = buildVolunteer()

function buildMetricData(
  user: Types.ObjectId,
  session: Session,
  feedback?: FeedbackVersionTwo
): METRICS.MetricData {
  return {
    user: user,
    student,
    volunteer,
    session,
    feedback
  }
}

function startSession(): Session {
  const session = buildSession()
  session.student = student._id
  return session
}

function joinSession(session: Session): void {
  session.volunteerJoinedAt = new Date()
  session.volunteer = volunteer._id
}

function sendMessage(session: Session, message: Message): void {
  session.messages.push(message)
}

describe('Metrics have correct "getUpdateValue" functions', () => {
  test('Absent student', () => {
    const session = startSession()
    sendMessage(session, buildMessage({ user: student._id }))
    joinSession(session)
    sendMessage(session, buildMessage({ user: volunteer._id }))

    const md = buildMetricData(student._id, session)
    expect(METRICS.ABSENT_STUDENT.getUpdateValue(md)).toBeTruthy()
  })

  test('Absent volunteer', () => {
    const session = startSession()
    sendMessage(session, buildMessage({ user: student._id }))
    joinSession(session)
    sendMessage(session, buildMessage({ user: student._id }))

    const md = buildMetricData(volunteer._id, session)
    expect(METRICS.ABSENT_VOLUNTEER.getUpdateValue(md)).toBeTruthy()
  })

  test('Low coach rating from student (tutoring)', () => {
    const session = startSession()
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.studentTutoringFeedback['coach-rating'] = 1

    const md = buildMetricData(student._id, session, feedback)
    expect(
      METRICS.LOW_COACH_RATING_FROM_STUDENT.getUpdateValue(md)
    ).toBeTruthy()
  })

  test('Low session rating from student (tutoring)', () => {
    const session = startSession()
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.studentTutoringFeedback['session-goal'] = 1

    const md = buildMetricData(student._id, session, feedback)
    expect(
      METRICS.LOW_SESSION_RATING_FROM_STUDENT.getUpdateValue(md)
    ).toBeTruthy()
  })
  test('Low coach rating from student (CC)', () => {
    const session = startSession()
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.studentCounselingFeedback['coach-ratings']['coach-friendly'] = 1

    const md = buildMetricData(student._id, session, feedback)
    expect(
      METRICS.LOW_COACH_RATING_FROM_STUDENT.getUpdateValue(md)
    ).toBeTruthy()
  })

  test('Low session rating from student (CC)', () => {
    const session = startSession()
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.studentCounselingFeedback['rate-session'].rating = 1

    const md = buildMetricData(student._id, session, feedback)
    expect(
      METRICS.LOW_SESSION_RATING_FROM_STUDENT.getUpdateValue(md)
    ).toBeTruthy()
  })

  test('Low session rating from volunteer', () => {
    const session = startSession()
    joinSession(session)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback['session-enjoyable'] = 1

    const md = buildMetricData(volunteer._id, session, feedback)
    expect(
      METRICS.LOW_SESSION_RATING_FROM_COACH.getUpdateValue(md)
    ).toBeTruthy()
  })

  test('Reported', () => {
    const session = startSession()
    session.isReported = true

    const md = buildMetricData(student._id, session)
    expect(METRICS.REPORTED.getUpdateValue(md)).toBeTruthy()
  })

  test('Rude or inappropriate', () => {
    const session = startSession()
    joinSession(session)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback['session-obstacles'] = [6]

    const md = buildMetricData(volunteer._id, session, feedback)
    expect(METRICS.RUDE_OR_INAPPROPRIATE.getUpdateValue(md)).toBeTruthy()
  })

  test('Only looking for answers', () => {
    const session = startSession()
    joinSession(session)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback['session-obstacles'] = [7]

    const md = buildMetricData(volunteer._id, session, feedback)
    expect(METRICS.ONLY_LOOKING_FOR_ANSWERS.getUpdateValue(md)).toBeTruthy()
  })

  test('Comments (student)', () => {
    const session = startSession()
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.studentTutoringFeedback['other-feedback'] = 'hello'

    const md = buildMetricData(student._id, session, feedback)
    expect(METRICS.COMMENTS.getUpdateValue(md)).toBeTruthy()
  })

  test('Comments (volunteer)', () => {
    const session = startSession()
    joinSession(session)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback['other-feedback'] = 'hello'

    const md = buildMetricData(volunteer._id, session, feedback)
    expect(METRICS.COMMENTS.getUpdateValue(md)).toBeTruthy()
  })

  test('Has been unmatched', () => {
    const session = startSession()

    const md = buildMetricData(student._id, session)
    expect(METRICS.HAS_BEEN_UNMATCHED.getUpdateValue(md)).toBeTruthy()
  })

  test('Has had technical issues (student)', () => {
    const session = startSession()
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback['session-obstacles'] = [0]

    const md = buildMetricData(student._id, session, feedback)
    expect(METRICS.HAS_HAD_TECHNICAL_ISSUES.getUpdateValue(md)).toBeTruthy()
  })

  test('Has had technical issues (volunteer)', () => {
    const session = startSession()
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback['session-obstacles'] = [0]

    const md = buildMetricData(volunteer._id, session, feedback)
    expect(METRICS.HAS_HAD_TECHNICAL_ISSUES.getUpdateValue(md)).toBeTruthy()
  })
})

describe('Metrics have correct "update" functions', () => {
  const session = startSession()
  joinSession(session)
  const md = buildMetricData(student._id, session)

  test('Absent student', () => {
    const metric = METRICS.ABSENT_STUDENT
    expect(metric.update(md)).not.toThrow()

    expect(incrementCounterByUserId).toHaveBeenCalledWith(md.user, metric.key)
    expect(updateFlags).toHaveBeenCalledWith(md.session._id, [metric.key])
  })

  test('Absent volunteer', () => {
    const metric = METRICS.ABSENT_VOLUNTEER
    expect(metric.update(md)).not.toThrow()

    expect(incrementCounterByUserId).toHaveBeenCalledWith(md.user, metric.key)
    expect(updateFlags).toHaveBeenCalledWith(md.session._id, [metric.key])
  })

  test('Low coach rating from student', () => {
    const metric = METRICS.LOW_COACH_RATING_FROM_STUDENT
    expect(metric.update(md)).not.toThrow()

    expect(incrementCounterByUserId).toHaveBeenCalledWith(md.user, metric.key)
    expect(updateFlags).toHaveBeenCalledWith(md.session._id, [metric.key])
  })

  test('Low session rating from student', () => {
    const metric = METRICS.LOW_SESSION_RATING_FROM_STUDENT
    expect(metric.update(md)).not.toThrow()

    expect(incrementCounterByUserId).toHaveBeenCalledWith(md.user, metric.key)
    expect(updateFlags).toHaveBeenCalledWith(md.session._id, [metric.key])
  })

  test('Low session rating from volunteer', () => {
    const metric = METRICS.LOW_SESSION_RATING_FROM_COACH
    expect(metric.update(md)).not.toThrow()

    expect(incrementCounterByUserId).toHaveBeenCalledWith(md.user, metric.key)
    expect(updateFlags).toHaveBeenCalledWith(md.session._id, [metric.key])
  })

  test('Reported', () => {
    const metric = METRICS.REPORTED
    expect(metric.update(md)).not.toThrow()

    expect(incrementCounterByUserId).toHaveBeenCalledWith(md.user, metric.key)
    expect(updateFlags).toHaveBeenCalledWith(md.session._id, [metric.key])
  })

  test('Rude or inappropriate', () => {
    const metric = METRICS.RUDE_OR_INAPPROPRIATE
    expect(metric.update(md)).not.toThrow()

    expect(incrementCounterByUserId).toHaveBeenCalledWith(md.user, metric.key)
    expect(updateFlags).toHaveBeenCalledWith(md.session._id, [metric.key])
  })

  test('Only looking for answers', () => {
    const metric = METRICS.ONLY_LOOKING_FOR_ANSWERS
    expect(metric.update(md)).not.toThrow()

    expect(incrementCounterByUserId).toHaveBeenCalledWith(md.user, metric.key)
    expect(updateFlags).toHaveBeenCalledWith(md.session._id, [metric.key])
  })

  test('Comments', () => {
    const metric = METRICS.COMMENTS
    expect(metric.update(md)).not.toThrow()

    expect(incrementCounterByUserId).toHaveBeenCalledWith(md.user, metric.key)
    expect(updateFlags).toHaveBeenCalledWith(md.session._id, [metric.key])
  })

  test('Has been unmatched', () => {
    const metric = METRICS.HAS_BEEN_UNMATCHED
    expect(metric.update(md)).not.toThrow()

    expect(incrementCounterByUserId).toHaveBeenCalledWith(md.user, metric.key)
  })

  test('Has had technical issues', () => {
    const metric = METRICS.HAS_HAD_TECHNICAL_ISSUES
    expect(metric.update(md)).not.toThrow()

    expect(incrementCounterByUserId).toHaveBeenCalledWith(md.user, metric.key)
  })
})
