test.todo('postgres migration')
/*import moment from 'moment'
import { FEEDBACK_VERSIONS, USER_SESSION_METRICS } from '../../../constants'
import { FeedbackVersionTwo } from '../../../models/Feedback'
import { Message } from '../../../models/Message'
import { Session } from '../../../models/Session'
import { Counter } from '../../../models/UserSessionMetrics'
import QueueService from '../../../services/QueueService'
import { METRIC_PROCESSORS } from '../../../services/UserSessionMetricsService/metrics'
import {
  CounterMetricProcessor,
  ProcessorData,
  UpdateValueData,
} from '../../../services/UserSessionMetricsService/types'
import { Jobs } from '../../../worker/jobs'
import {
  buildFeedback,
  buildMessage,
  buildSession,
  buildStudent,
  buildUSM,
  buildVolunteer,
  joinSession,
  startSession,
} from '../../generate'

jest.mock('../../../models/UserSessionMetrics', () => ({
  ...jest.requireActual('../../../models/UserSessionMetrics'),
  executeUpdatesByUserId: jest.fn().mockResolvedValue({}),
}))
jest.mock('../../../services/QueueService')

const student = buildStudent()
const volunteer = buildVolunteer()

function buildUpdateValueData(
  session: Session,
  feedback?: FeedbackVersionTwo
): UpdateValueData {
  return {
    session,
    feedback,
  }
}

function sendMessage(session: Session, message: Message): void {
  session.messages.push(message)
}

describe('Metrics have correct "computeUpdateValue" functions', () => {
  test('Absent student if student sends 0 msgs after volunteer joins and volunteer waits 10 minutes to end session', () => {
    const time = moment()
    const session = buildSession({
      student: student._id,
      volunteer: volunteer._id,
      createdAt: moment(time).toDate(),
      volunteerJoinedAt: moment(time)
        .add(11, 'minutes')
        .toDate(),
      endedAt: moment(time)
        .add(22, 'minutes')
        .toDate(),
    })
    sendMessage(
      session,
      buildMessage({
        user: student._id,
        createdAt: moment(time)
          .add(1, 'minutes')
          .toDate(),
      })
    )

    const uvd = buildUpdateValueData(session)
    const processor = METRIC_PROCESSORS.AbsentStudent
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Not an absent student if volunteer ends session before 10 mins', () => {
    const time = moment()
    const session = buildSession({
      student: student._id,
      volunteer: volunteer._id,
      createdAt: moment(time).toDate(),
      volunteerJoinedAt: moment(time)
        .add(11, 'minutes')
        .toDate(),
      endedAt: moment(time)
        .add(12, 'minutes')
        .toDate(),
    })
    sendMessage(
      session,
      buildMessage({
        user: student._id,
        createdAt: moment(time)
          .add(1, 'minutes')
          .toDate(),
      })
    )

    const uvd = buildUpdateValueData(session)
    const processor = METRIC_PROCESSORS.AbsentStudent
    expect(processor.computeUpdateValue(uvd)).toEqual(0)
  })

  test('Not an absent student if student sends any msgs after volunteer joins', () => {
    const time = moment()
    const session = buildSession({
      student: student._id,
      volunteer: volunteer._id,
      createdAt: moment(time).toDate(),
      volunteerJoinedAt: moment(time)
        .add(11, 'minutes')
        .toDate(),
      endedAt: moment(time)
        .add(22, 'minutes')
        .toDate(),
    })
    sendMessage(
      session,
      buildMessage({
        user: student._id,
        createdAt: moment(time)
          .add(12, 'minutes')
          .toDate(),
      })
    )

    const uvd = buildUpdateValueData(session)
    const processor = METRIC_PROCESSORS.AbsentStudent
    expect(processor.computeUpdateValue(uvd)).toEqual(0)
  })

  test('Absent volunteer if volunteer sends 0 msgs and student waits 5 minutes to end session', () => {
    const time = moment()
    const session = buildSession({
      student: student._id,
      volunteer: volunteer._id,
      createdAt: moment(time).toDate(),
      volunteerJoinedAt: moment(time)
        .add(11, 'minutes')
        .toDate(),
      endedAt: moment(time)
        .add(17, 'minutes')
        .toDate(),
    })
    sendMessage(
      session,
      buildMessage({
        user: student._id,
        createdAt: moment(time)
          .add(1, 'minutes')
          .toDate(),
      })
    )

    const uvd = buildUpdateValueData(session)
    const processor = METRIC_PROCESSORS.AbsentVolunteer
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Not an absent volunteer if volunteer sends 0 msgs and student ends session before 5 mins', () => {
    const time = moment()
    const session = buildSession({
      student: student._id,
      volunteer: volunteer._id,
      createdAt: moment(time).toDate(),
      volunteerJoinedAt: moment(time)
        .add(11, 'minutes')
        .toDate(),
      endedAt: moment(time)
        .add(12, 'minutes')
        .toDate(),
    })
    sendMessage(
      session,
      buildMessage({
        user: student._id,
        createdAt: moment(time)
          .add(1, 'minutes')
          .toDate(),
      })
    )

    const uvd = buildUpdateValueData(session)
    const processor = METRIC_PROCESSORS.AbsentVolunteer
    expect(processor.computeUpdateValue(uvd)).toEqual(0)
  })

  test('Not an absent volunteer if volunteer sends msgs', () => {
    const time = moment()
    const session = buildSession({
      student: student._id,
      volunteer: volunteer._id,
      createdAt: moment(time).toDate(),
      volunteerJoinedAt: moment(time)
        .add(11, 'minutes')
        .toDate(),
      endedAt: moment(time)
        .add(22, 'minutes')
        .toDate(),
    })
    sendMessage(
      session,
      buildMessage({
        user: volunteer._id,
        createdAt: moment(time)
          .add(12, 'minutes')
          .toDate(),
      })
    )

    const uvd = buildUpdateValueData(session)
    const processor = METRIC_PROCESSORS.AbsentVolunteer
    expect(processor.computeUpdateValue(uvd)).toEqual(0)
  })

  test('Low coach rating from student (tutoring)', () => {
    const session = startSession(student)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO,
      studentTutoringFeedback: {
        'coach-rating': 1,
      },
    }) as FeedbackVersionTwo

    const uvd = buildUpdateValueData(session, feedback)
    const processor = METRIC_PROCESSORS.LowCoachRatingFromStudent
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Low session rating from student (tutoring)', () => {
    const session = startSession(student)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO,
      studentTutoringFeedback: {
        'session-goal': 1,
      },
    }) as FeedbackVersionTwo

    feedback.studentTutoringFeedback!['session-goal'] = 1

    const uvd = buildUpdateValueData(session, feedback)
    const processor = METRIC_PROCESSORS.LowSessionRatingFromStudent
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Low coach rating from student (CC)', () => {
    const session = startSession(student)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO,
    }) as FeedbackVersionTwo

    feedback.studentCounselingFeedback!['coach-ratings']!['coach-friendly'] = 1

    const uvd = buildUpdateValueData(session, feedback)
    const processor = METRIC_PROCESSORS.LowCoachRatingFromStudent
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Low session rating from student (CC)', () => {
    const session = startSession(student)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO,
    }) as FeedbackVersionTwo

    feedback.studentCounselingFeedback!['rate-session']!.rating = 1

    const uvd = buildUpdateValueData(session, feedback)
    const processor = METRIC_PROCESSORS.LowSessionRatingFromStudent
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Low session rating from coach', () => {
    const session = startSession(student)
    joinSession(session, volunteer)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO,
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback!['session-enjoyable'] = 1

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
      versionNumber: FEEDBACK_VERSIONS.TWO,
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback!['session-obstacles'] = [7]

    const uvd = buildUpdateValueData(session, feedback)
    const processor = METRIC_PROCESSORS.RudeOrInappropriate
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Only looking for answers', () => {
    const session = startSession(student)
    joinSession(session, volunteer)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO,
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback!['session-obstacles'] = [8]

    const uvd = buildUpdateValueData(session, feedback)
    const processor = METRIC_PROCESSORS.OnlyLookingForAnswers
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Comment from student', () => {
    const session = startSession(student)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO,
    }) as FeedbackVersionTwo

    feedback.studentTutoringFeedback!['other-feedback'] = 'hello'

    const uvd = buildUpdateValueData(session, feedback)
    const processor = METRIC_PROCESSORS.CommentFromStudent
    expect(processor.computeUpdateValue(uvd)).toEqual(1)
  })

  test('Comment from volunteer', () => {
    const session = startSession(student)
    joinSession(session, volunteer)
    const feedback = buildFeedback({
      versionNumber: FEEDBACK_VERSIONS.TWO,
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback!['other-feedback'] = 'hello'

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
      versionNumber: FEEDBACK_VERSIONS.TWO,
    }) as FeedbackVersionTwo

    feedback.volunteerFeedback!['session-obstacles'] = [1]

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
    public triggerActions = () => []
  }
  const processor = new TestCounter()

  test('Counter metric student query is correct', () => {
    const newUSM = buildUSM(student._id, { absentStudent: initialValue })
    const finalValue = processor.computeUpdateValue()
    const payload = {
      session,
      studentUSM: newUSM,
      value: finalValue,
    } as ProcessorData<Counter>

    expect(processor.computeStudentUpdateQuery(payload)).toEqual({
      'counters.absentStudent': updateValue + initialValue,
    })
  })

  test('Counter metric volunteer update query is correrct', () => {
    const newUSM = buildUSM(student._id, { absentStudent: initialValue })
    const otherUSM = buildUSM(volunteer._id, { absentStudent: initialValue })
    const finalValue = processor.computeUpdateValue()
    const payload = {
      session,
      studentUSM: newUSM,
      volunteerUSM: otherUSM,
      value: finalValue,
    } as ProcessorData<Counter>

    expect(processor.computeVolunteerUpdateQuery(payload)).toEqual({
      'counters.absentStudent': updateValue + initialValue,
    })
  })
})

describe('Metrics have correct "triggerActions" functions', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  const session = startSession(student)
  joinSession(session, volunteer)

  describe('AbsentStudent', () => {
    test('Queue a warning email to the student when they ghost a volunteer for the first time', () => {
      const studentUSM = buildUSM(student._id, { absentStudent: 0 })
      const volunteerUSM = buildUSM(volunteer._id, { absentStudent: 1 })
      const payload = {
        session,
        studentUSM,
        volunteerUSM,
        value: 1,
      } as ProcessorData<Counter>

      const processor = METRIC_PROCESSORS.AbsentStudent
      const result = processor.triggerActions(payload)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailStudentAbsentWarning,
        {
          sessionSubtopic: session.subTopic,
          sessionDate: session.createdAt,
          studentId: session.student,
          volunteerId: session.volunteer,
        }
      )
      expect(result).toHaveLength(1)
    })

    test('Queue an apology email to the volunteer because a student ghosted them for the first time', () => {
      const studentUSM = buildUSM(student._id, { absentStudent: 1 })
      const volunteerUSM = buildUSM(volunteer._id, { absentStudent: 0 })
      const payload = {
        session,
        studentUSM,
        volunteerUSM,
        value: 1,
      } as ProcessorData<Counter>

      const processor = METRIC_PROCESSORS.AbsentStudent
      const result = processor.triggerActions(payload)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentStudentApology,
        {
          sessionSubtopic: session.subTopic,
          sessionDate: session.createdAt,
          studentId: session.student,
          volunteerId: session.volunteer,
        }
      )
      expect(result).toHaveLength(1)
    })

    test('Should return empty list of actions if both users experienced absent student before', () => {
      const studentUSM = buildUSM(student._id, { absentStudent: 2 })
      const volunteerUSM = buildUSM(volunteer._id, { absentStudent: 2 })
      const payload = {
        session,
        studentUSM,
        volunteerUSM,
        value: 1,
      } as ProcessorData<Counter>

      const processor = METRIC_PROCESSORS.AbsentStudent
      const result = processor.triggerActions(payload)
      expect(QueueService.add).not.toHaveBeenCalled()
      expect(result).toHaveLength(0)
    })
  })

  describe('AbsentVolunteer', () => {
    test('Queue a warning email to the volunteer when they ghost a student for the first time', () => {
      const studentUSM = buildUSM(student._id, { absentVolunteer: 3 })
      const volunteerUSM = buildUSM(volunteer._id, { absentVolunteer: 0 })
      const payload = {
        session,
        studentUSM,
        volunteerUSM,
        value: 1,
      } as ProcessorData<Counter>

      const processor = METRIC_PROCESSORS.AbsentVolunteer
      const result = processor.triggerActions(payload)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentWarning,
        {
          sessionSubtopic: session.subTopic,
          sessionDate: session.createdAt,
          studentId: session.student,
          volunteerId: session.volunteer,
        }
      )
      expect(result).toHaveLength(1)
    })

    test('Queue an apology email to the student because a volunteer ghosted them for the first time', () => {
      const studentUSM = buildUSM(student._id, { absentVolunteer: 0 })
      const volunteerUSM = buildUSM(volunteer._id, { absentVolunteer: 2 })
      const payload = {
        session,
        studentUSM,
        volunteerUSM,
        value: 1,
      } as ProcessorData<Counter>

      const processor = METRIC_PROCESSORS.AbsentVolunteer
      const result = processor.triggerActions(payload)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailStudentAbsentVolunteerApology,
        {
          sessionSubtopic: session.subTopic,
          sessionDate: session.createdAt,
          studentId: session.student,
          volunteerId: session.volunteer,
        }
      )
      expect(result).toHaveLength(1)
    })

    test('Should return empty list of actions if both users experienced absent volunteer before', () => {
      const studentUSM = buildUSM(student._id, { absentVolunteer: 2 })
      const volunteerUSM = buildUSM(volunteer._id, { absentVolunteer: 2 })
      const payload = {
        session,
        studentUSM,
        volunteerUSM,
        value: 1,
      } as ProcessorData<Counter>

      const processor = METRIC_PROCESSORS.AbsentVolunteer
      const result = processor.triggerActions(payload)
      expect(QueueService.add).not.toHaveBeenCalled()
      expect(result).toHaveLength(0)
    })
  })

  describe('HasBeenUnmatched', () => {
    test('Queue an unmatched apology email to the student when they have a session that was unmatched for the first time', () => {
      const studentUSM = buildUSM(student._id, { hasBeenUnmatched: 0 })
      const payload = {
        session,
        studentUSM,
        value: 1,
      } as ProcessorData<Counter>

      const processor = METRIC_PROCESSORS.HasBeenUnmatched
      const result = processor.triggerActions(payload)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailStudentUnmatchedApology,
        {
          sessionSubtopic: session.subTopic,
          sessionDate: session.createdAt,
          studentId: session.student,
          volunteerId: session.volunteer,
        }
      )
      expect(result).toHaveLength(1)
    })

    test('Should return empty list of actions if student has experienced an unmatched session before', () => {
      const studentUSM = buildUSM(student._id, { hasBeenUnmatched: 2 })
      const payload = {
        session,
        studentUSM,
        value: 1,
      } as ProcessorData<Counter>

      const processor = METRIC_PROCESSORS.HasBeenUnmatched
      const result = processor.triggerActions(payload)
      expect(QueueService.add).not.toHaveBeenCalled()
      expect(result).toHaveLength(0)
    })
  })

    test('Should return empty list of actions if no technical issue was submitted for the session', () => {
      const studentUSM = buildUSM(student._id, { hasHadTechnicalIssues: 2 })
      const volunteerUSM = buildUSM(student._id, { hasHadTechnicalIssues: 3 })
      const payload = {
        session,
        studentUSM,
        volunteerUSM,
        value: 0,
      } as ProcessorData<Counter>

      const processor = METRIC_PROCESSORS.HasHadTechnicalIssues
      const result = processor.triggerActions(payload)
      expect(QueueService.add).not.toHaveBeenCalled()
      expect(result).toHaveLength(0)
    })
  })

  describe('OnlyLookingForAnswers', () => {
    test('Queue an only looking for answers email when a student is marked as only looking for answers for the first time', () => {
      const studentUSM = buildUSM(student._id, { onlyLookingForAnswers: 0 })
      const payload = {
        session,
        studentUSM,
        value: 1,
      } as ProcessorData<Counter>

      const processor = METRIC_PROCESSORS.OnlyLookingForAnswers
      const result = processor.triggerActions(payload)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailStudentOnlyLookingForAnswers,
        {
          sessionSubtopic: session.subTopic,
          sessionDate: session.createdAt,
          studentId: session.student,
          volunteerId: session.volunteer,
        }
      )
      expect(result).toHaveLength(1)
    })

    test('Should not queue an only looking for answers email when a student has already been marked as only looking for answers', () => {
      const studentUSM = buildUSM(student._id, { onlyLookingForAnswers: 1 })
      const payload = {
        session,
        studentUSM,
        value: 1,
      } as ProcessorData<Counter>

      const processor = METRIC_PROCESSORS.OnlyLookingForAnswers
      const result = processor.triggerActions(payload)
      expect(QueueService.add).not.toHaveBeenCalled()
      expect(result).toHaveLength(0)
    })
  })

  const processorsWithNoTriggerActions = [
    METRIC_PROCESSORS.LowCoachRatingFromStudent,
    METRIC_PROCESSORS.LowSessionRatingFromStudent,
    METRIC_PROCESSORS.LowSessionRatingFromCoach,
    METRIC_PROCESSORS.Reported,
    METRIC_PROCESSORS.RudeOrInappropriate,
    METRIC_PROCESSORS.CommentFromStudent,
    METRIC_PROCESSORS.CommentFromVolunteer,
  ]
  for (const processor of processorsWithNoTriggerActions) {
    test(`Should return an empty list of actions for ${processor.constructor.name}`, () => {
      const result = processor.triggerActions()
      expect(result).toHaveLength(0)
    })
  }
})
*/
