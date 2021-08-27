import { Types } from 'mongoose'

import {
  MetricData,
  CounterMetricClass
} from '../../../services/UserSessionMetricsService/metric-types'
import * as MetricClasses from '../../../services/UserSessionMetricsService/metrics'
import { METRICS, UserSessionMetrics } from '../../../models/UserSessionMetrics'
import { Session } from '../../../models/Session'
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
  executeUpdatesByUserId: jest.fn().mockResolvedValue({})
}))

function buildUSM(
  userId: Types.ObjectId,
  counterOverrides: any = {} // TODO: type this better
): UserSessionMetrics {
  return {
    _id: Types.ObjectId(),
    user: userId,
    counters: {
      absentStudent: 0,
      absentVolunteer: 0,
      lowSessionRatingFromCoach: 0,
      lowSessionRatingFromStudent: 0,
      lowCoachRatingFromStudent: 0,
      reported: 0,
      onlyLookingForAnswers: 0,
      rudeOrInappropriate: 0,
      commentFromStudent: 0,
      commentFromVolunteer: 0,
      hasBeenUnmatched: 0,
      hasHadTechnicalIssues: 0,
      ...counterOverrides
    }
  }
}

const student = buildStudent()
const volunteer = buildVolunteer()
const studentUSM = buildUSM(student._id)

function buildMetricData(
  studentUSM: UserSessionMetrics,
  session: Session,
  feedback?: FeedbackVersionTwo,
  volunteerUSM?: UserSessionMetrics
): MetricData {
  return {
    studentUSM,
    volunteerUSM,
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

describe('Metrics have correct "computeUpdateValue" functions', () => {
  test('Absent student', () => {
    const session = startSession()
    sendMessage(session, buildMessage({ user: student._id }))
    joinSession(session)
    sendMessage(session, buildMessage({ user: volunteer._id }))

    const md = buildMetricData(studentUSM, session)
    const processor = new MetricClasses.AbsentStudent(md)
    expect(processor.computeUpdateValue()).toEqual(1)
  })

  test('Absent volunteer', () => {
    const session = startSession()
    sendMessage(session, buildMessage({ user: student._id }))
    joinSession(session)
    sendMessage(session, buildMessage({ user: student._id }))

    const md = buildMetricData(studentUSM, session)
    const processor = new MetricClasses.AbsentVolunteer(md)
    expect(processor.computeUpdateValue()).toEqual(1)
  })

  test('Low coach rating from student (tutoring)', () => {
    const session = startSession()
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.studentTutoringFeedback['coach-rating'] = 1

    const md = buildMetricData(studentUSM, session, feedback)
    const processor = new MetricClasses.LowCoachRatingFromStudent(md)
    expect(processor.computeUpdateValue()).toEqual(1)
  })

  test('Low session rating from student (tutoring)', () => {
    const session = startSession()
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.studentTutoringFeedback['session-goal'] = 1

    const md = buildMetricData(studentUSM, session, feedback)
    const processor = new MetricClasses.LowSessionRatingFromStudent(md)
    expect(processor.computeUpdateValue()).toEqual(1)
  })

  test('Low coach rating from student (CC)', () => {
    const session = startSession()
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.studentCounselingFeedback['coach-ratings']['coach-friendly'] = 1

    const md = buildMetricData(studentUSM, session, feedback)
    const processor = new MetricClasses.LowCoachRatingFromStudent(md)
    expect(processor.computeUpdateValue()).toEqual(1)
  })

  test('Low session rating from student (CC)', () => {
    const session = startSession()
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.studentCounselingFeedback['rate-session'].rating = 1

    const md = buildMetricData(studentUSM, session, feedback)
    const processor = new MetricClasses.LowSessionRatingFromStudent(md)
    expect(processor.computeUpdateValue()).toEqual(1)
  })

  test('Low session rating from coach', () => {
    const session = startSession()
    joinSession(session)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback['session-enjoyable'] = 1

    const md = buildMetricData(studentUSM, session, feedback)
    const processor = new MetricClasses.LowSessionRatingFromCoach(md)
    expect(processor.computeUpdateValue()).toEqual(1)
  })

  test('Reported', () => {
    const session = startSession()
    session.isReported = true

    const md = buildMetricData(studentUSM, session)
    const processor = new MetricClasses.Reported(md)
    expect(processor.computeUpdateValue()).toEqual(1)
  })

  test('Rude or inappropriate', () => {
    const session = startSession()
    joinSession(session)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback['session-obstacles'] = [6]

    const md = buildMetricData(studentUSM, session, feedback)
    const processor = new MetricClasses.RudeOrInappropriate(md)
    expect(processor.computeUpdateValue()).toEqual(1)
  })

  test('Only looking for answers', () => {
    const session = startSession()
    joinSession(session)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback['session-obstacles'] = [7]

    const md = buildMetricData(studentUSM, session, feedback)
    const processor = new MetricClasses.OnlyLookingForAnswers(md)
    expect(processor.computeUpdateValue()).toEqual(1)
  })

  test('Comment from student', () => {
    const session = startSession()
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.studentTutoringFeedback['other-feedback'] = 'hello'

    const md = buildMetricData(studentUSM, session, feedback)
    const processor = new MetricClasses.CommentFromStudent(md)
    expect(processor.computeUpdateValue()).toEqual(1)
  })

  test('Comment from volunteer', () => {
    const session = startSession()
    joinSession(session)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback['other-feedback'] = 'hello'

    const md = buildMetricData(studentUSM, session, feedback)
    const processor = new MetricClasses.CommentFromVolunteer(md)
    expect(processor.computeUpdateValue()).toEqual(1)
  })

  test('Has been unmatched', () => {
    const session = startSession()

    const md = buildMetricData(studentUSM, session)
    const processor = new MetricClasses.HasBeenUnmatched(md)
    expect(processor.computeUpdateValue()).toEqual(1)
  })

  test('Has had technical issues', () => {
    const session = startSession()
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback['session-obstacles'] = [0]

    const md = buildMetricData(studentUSM, session, feedback)
    const processor = new MetricClasses.HasHadTechnicalIssues(md)
    expect(processor.computeUpdateValue()).toEqual(1)
  })
})

describe('Metrics have correct "update" functions', () => {
  const session = startSession()
  joinSession(session)
  const feedback = buildFeedback({
    versionNumber: FEEDBACK_VERSIONS.TWO
  }) as FeedbackVersionTwo

  const initialValue = 2
  const updateValue = 5

  class TestCounter extends CounterMetricClass {
    public key = METRICS.absentStudent

    constructor(md: MetricData) {
      super(md)
      this.setup()
    }

    public computeUpdateValue = () => updateValue
    public review = () => false
    public flag = () => [] as string[]
  }

  test('Counter metric student final value is correct', () => {
    const newUSM = buildUSM(student._id, { absentStudent: initialValue })
    const md = buildMetricData(newUSM, session)
    const processor = new TestCounter(md)

    expect(processor.studentValue).toEqual(updateValue + initialValue)
  })

  test('Counter metric student update query is correrct', () => {
    const newUSM = buildUSM(student._id, { absentStudent: initialValue })
    const md = buildMetricData(newUSM, session)
    const processor = new TestCounter(md)

    expect(processor.buildStudentUpdateQuery()).toEqual({
      'counters.absentStudent': updateValue + initialValue
    })
  })

  test('Counter metric volunteer final value is correct', () => {
    const studentUSM = buildUSM(student._id, { absentStudent: initialValue })
    const volunteerUSM = buildUSM(volunteer._id, {
      absentStudent: initialValue
    })
    const md = buildMetricData(studentUSM, session, feedback, volunteerUSM)
    const processor = new TestCounter(md)

    expect(processor.volunteerValue).toEqual(updateValue + initialValue)
  })

  test('Counter metric volunteer update query is correrct', () => {
    const studentUSM = buildUSM(student._id, { absentStudent: initialValue })
    const volunteerUSM = buildUSM(volunteer._id, {
      absentStudent: initialValue
    })
    const md = buildMetricData(studentUSM, session, feedback, volunteerUSM)
    const processor = new TestCounter(md)

    expect(processor.buildVolunteerUpdateQuery()).toEqual({
      'counters.absentStudent': updateValue + initialValue
    })
  })
})
