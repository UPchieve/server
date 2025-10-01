import { mocked } from 'jest-mock'
import moment from 'moment'
import {
  buildMessageForFrontend,
  buildSession,
  buildSurveyResponse,
  buildUserSessionMetrics,
  getSentence,
} from '../mocks/generate'
import {
  SESSION_REPORT_REASON,
  USER_SESSION_METRICS,
  UserSessionFlags,
} from '../../constants'
import { getUuid } from '../../models/pgUtils'
import * as SessionRepo from '../../models/Session'
import * as UserSessionMetricsRepo from '../../models/UserSessionMetrics'
import {
  getPostsessionSurveyResponsesForSessionMetrics,
  PostsessionSurveyResponse,
} from '../../models/Survey'
import QueueService from '../../services/QueueService'
import {
  computeSessionFlags,
  computeFeedbackFlags,
  computeReportedFlags,
  computeSessionReviewReasonsFromFlags,
  computeFeedbackReviewReasonsFromFlags,
  computeReportedReviewReason,
  triggerSessionActions,
  triggerFeedbackActions,
  computeLowCoachRatingFromStudent,
  computeLowSessionRatingFromStudent,
  computeLowSessionRatingFromCoach,
  VOLUNTEER_WAITING_PERIOD_MIN,
  STUDENT_WAITING_PERIOD_MIN,
  processMetrics,
} from '../../services/SessionFlagsService'
import { Jobs } from '../../worker/jobs'

jest.mock('../../models/Session')
jest.mock('../../models/Survey')
jest.mock('../../services/QueueService')
jest.mock('../../services/SessionService')
jest.mock('../../models/UserSessionMetrics')

const mockedSessionRepo = mocked(SessionRepo)
const mockedGetPostsessionSurveyResponsesForSessionMetrics = mocked(
  getPostsessionSurveyResponsesForSessionMetrics
)
const volunteerJoinedAt = new Date('2025-01-01 00:00:00.000000+00')

const mockedUserSessionMetricsRepo = mocked(UserSessionMetricsRepo)
const mockedComputeSessionFlags = jest.fn(() => [])
const mockedComputeReviewReasons = jest.fn(() => [
  UserSessionFlags.absentStudent,
  UserSessionFlags.coachReportedStudentDm,
])

const mockedOnlyExcludedReviewReasons = jest.fn(() => [
  UserSessionFlags.absentStudent,
])

describe('SessionFlagsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('computeSessionFlags', () => {
    test(`Should not contain ${UserSessionFlags.absentStudent} if no volunteer joined`, async () => {
      const studentId = getUuid()
      const session = buildSession({
        studentId,
      })
      const messages: SessionRepo.MessageForFrontend[] = []
      mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

      const result = await computeSessionFlags(session)
      expect(result).not.toContain(UserSessionFlags.absentStudent)
    })

    test(`Should not contain ${UserSessionFlags.absentStudent} if volunteer doesn't wait long enough to give the student a chance to respond`, async () => {
      const studentId = getUuid()
      const volunteerId = getUuid()
      const session = buildSession({
        studentId,
        volunteerId,
        volunteerJoinedAt,
        endedAt: moment(volunteerJoinedAt)
          .add(STUDENT_WAITING_PERIOD_MIN, 'minutes')
          .toDate(),
      })
      const messages: SessionRepo.MessageForFrontend[] = []
      mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

      const result = await computeSessionFlags(session)
      expect(result).not.toContain(UserSessionFlags.absentStudent)
    })

    test(`Should not contain ${UserSessionFlags.absentStudent} if the student sent messages after the volunteer joined`, async () => {
      const studentId = getUuid()
      const volunteerId = getUuid()
      const session = buildSession({
        studentId,
        volunteerId,
        volunteerJoinedAt,
        endedAt: moment(volunteerJoinedAt)
          .add(VOLUNTEER_WAITING_PERIOD_MIN + 10, 'minutes')
          .toDate(),
      })
      const messages: SessionRepo.MessageForFrontend[] = [
        buildMessageForFrontend({
          user: studentId,
          contents: getSentence(),
          createdAt: moment(volunteerJoinedAt).add(2, 'minutes').toDate(),
        }),
      ]
      mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

      const result = await computeSessionFlags(session)
      expect(result).not.toContain(UserSessionFlags.absentStudent)
    })

    test(`Should contain ${UserSessionFlags.absentStudent} if the student did not send messages after volunteer joined`, async () => {
      const studentId = getUuid()
      const volunteerId = getUuid()
      const volunteerJoinedAt = new Date('2025-01-01 00:00:00.000000+00')
      const session = buildSession({
        studentId,
        volunteerId,
        volunteerJoinedAt,
        endedAt: moment(volunteerJoinedAt)
          .add(VOLUNTEER_WAITING_PERIOD_MIN + 10, 'minutes')
          .toDate(),
      })
      const messages: SessionRepo.MessageForFrontend[] = []
      mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

      const result = await computeSessionFlags(session)
      expect(result).toContain(UserSessionFlags.absentStudent)
    })

    test(`Should not contain ${UserSessionFlags.absentVolunteer} if no volunteer joined the session`, async () => {
      const studentId = getUuid()
      const session = buildSession({
        studentId,
      })
      const messages: SessionRepo.MessageForFrontend[] = []
      mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

      const result = await computeSessionFlags(session)
      expect(result).not.toContain(UserSessionFlags.absentVolunteer)
    })

    test(`Should not contain ${UserSessionFlags.absentVolunteer} if student doesnt wait long enough to give volunteer chance to respond`, async () => {
      const studentId = getUuid()
      const volunteerId = getUuid()
      const session = buildSession({
        studentId,
        volunteerId,
        volunteerJoinedAt,
        endedAt: moment(volunteerJoinedAt).add(3, 'minutes').toDate(),
      })
      const messages: SessionRepo.MessageForFrontend[] = []
      mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

      const result = await computeSessionFlags(session)
      expect(result).not.toContain(UserSessionFlags.absentVolunteer)
    })

    test(`Should not contain ${UserSessionFlags.absentVolunteer} if volunteer sent messages after volunteer joined`, async () => {
      const studentId = getUuid()
      const volunteerId = getUuid()
      const session = buildSession({
        studentId,
        volunteerId,
        volunteerJoinedAt,
        endedAt: moment(volunteerJoinedAt)
          .add(VOLUNTEER_WAITING_PERIOD_MIN + 10, 'minutes')
          .toDate(),
      })
      const messages: SessionRepo.MessageForFrontend[] = [
        buildMessageForFrontend({
          user: volunteerId,
          contents: getSentence(),
          createdAt: moment(volunteerJoinedAt).add(2, 'minutes').toDate(),
        }),
      ]
      mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

      const result = await computeSessionFlags(session)
      expect(result).not.toContain(UserSessionFlags.absentVolunteer)
    })

    test(`Should contain ${UserSessionFlags.absentVolunteer} if volunteer did not send messages after joining session`, async () => {
      const studentId = getUuid()
      const volunteerId = getUuid()
      const session = buildSession({
        studentId,
        volunteerId,
        volunteerJoinedAt,
        endedAt: moment(volunteerJoinedAt)
          .add(VOLUNTEER_WAITING_PERIOD_MIN + 10, 'minutes')
          .toDate(),
      })
      const messages: SessionRepo.MessageForFrontend[] = []
      mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

      const result = await computeSessionFlags(session)
      expect(result).toContain(UserSessionFlags.absentVolunteer)
    })

    test(`Should not contain ${UserSessionFlags.hasBeenUnmatched} if a volunteer joined the session`, async () => {
      const studentId = getUuid()
      const volunteerId = getUuid()
      const session = buildSession({
        studentId,
        volunteerId,
      })
      const messages: SessionRepo.MessageForFrontend[] = []
      mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

      const result = await computeSessionFlags(session)
      expect(result).not.toContain(UserSessionFlags.hasBeenUnmatched)
    })

    test(`Should contain ${UserSessionFlags.hasBeenUnmatched} if no volunteer joined the session`, async () => {
      const studentId = getUuid()
      const session = buildSession({
        studentId,
      })
      const messages: SessionRepo.MessageForFrontend[] = []
      mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

      const result = await computeSessionFlags(session)
      expect(result).toContain(UserSessionFlags.hasBeenUnmatched)
    })
  })

  describe('computeFeedbackFlags', () => {
    test('Should compute feedback flags based on survey responses', async () => {
      const studentId = getUuid()
      const session = buildSession({
        studentId,
      })
      const surveyResponses: PostsessionSurveyResponse[] = [
        buildSurveyResponse({
          questionText: 'Overall, how supportive was your coach today?',
          score: 1,
        }),
        buildSurveyResponse({
          questionText: 'Did UPchieve help you achieve your goal?',
          score: 1,
        }),
        buildSurveyResponse({
          questionText: 'Were you able to help them achieve their goal?',
          score: 2,
        }),
        buildSurveyResponse({ response: 'Student was mean or inappropriate' }),
        buildSurveyResponse({
          response: 'Student was pressuring me to do their work for them',
        }),
        buildSurveyResponse({
          userRole: 'student',
          questionText:
            'This can be about the web app, the Academic Coach who helped you, the services UPchieve offers, etc.',
          response: 'test',
        }),
        buildSurveyResponse({
          userRole: 'volunteer',
          questionText:
            'This can be about the web app, the student you helped, technical issues, etc.',
          response: 'test',
        }),
        buildSurveyResponse({ response: 'Tech issue' }),
        buildSurveyResponse({
          response:
            'Student shared their email, last name, or other personally identifiable information',
        }),
        buildSurveyResponse({
          response: 'Student was working on a quiz or exam',
        }),
        buildSurveyResponse({ response: 'Student made me feel uncomfortable' }),
        buildSurveyResponse({
          response: 'Student is in severe emotional distress and/or unsafe',
        }),
      ]
      mockedGetPostsessionSurveyResponsesForSessionMetrics.mockResolvedValueOnce(
        surveyResponses
      )

      const result = await computeFeedbackFlags(session)
      const expectedFlags = [
        UserSessionFlags.lowCoachRatingFromStudent,
        UserSessionFlags.lowSessionRatingFromStudent,
        UserSessionFlags.lowSessionRatingFromCoach,
        UserSessionFlags.rudeOrInappropriate,
        UserSessionFlags.onlyLookingForAnswers,
        UserSessionFlags.commentFromStudent,
        UserSessionFlags.commentFromVolunteer,
        UserSessionFlags.hasHadTechnicalIssues,
        UserSessionFlags.personalIdentifyingInfo,
        UserSessionFlags.gradedAssignment,
        UserSessionFlags.coachUncomfortable,
        UserSessionFlags.studentCrisis,
      ]
      expect(
        mockedGetPostsessionSurveyResponsesForSessionMetrics
      ).toHaveBeenCalledWith(session.id)
      expect(result).toEqual(expectedFlags)
    })

    describe('computeLowCoachRatingFromStudent', () => {
      test('Should return false if question not found', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Test question',
            score: 10,
          }),
        ]
        const result = computeLowCoachRatingFromStudent(surveyResponses)
        expect(result).toEqual(false)
      })

      test('Should return false if coach rating from student is larger than 2', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Overall, how supportive was your coach today?',
            score: 3,
          }),
        ]
        const result = computeLowCoachRatingFromStudent(surveyResponses)
        expect(result).toEqual(false)
      })

      test('Should return true if coach rating from student is 2 or smaller', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Overall, how supportive was your coach today?',
            score: 2,
          }),
        ]
        const result = computeLowCoachRatingFromStudent(surveyResponses)
        expect(result).toEqual(true)
      })
    })

    describe('computeLowSessionRatingFromStudent', () => {
      test('Should return false if question not found', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Test question',
            score: 1,
          }),
        ]
        const result = computeLowSessionRatingFromStudent(surveyResponses)
        expect(result).toEqual(false)
      })

      test('Should return false if session rating from student is larger than 2', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Did UPchieve help you achieve your goal?',
            score: 3,
          }),
        ]
        const result = computeLowSessionRatingFromStudent(surveyResponses)
        expect(result).toEqual(false)
      })

      test('Should return true if session rating from student is 2 or smaller', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Did UPchieve help you achieve your goal?',
            score: 2,
          }),
        ]
        const result = computeLowSessionRatingFromStudent(surveyResponses)
        expect(result).toEqual(true)
      })
    })

    describe('computeLowSessionRatingFromCoach', () => {
      test('Should return false if question not found', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Test question',
            score: 1,
          }),
        ]
        const result = computeLowSessionRatingFromCoach(surveyResponses)
        expect(result).toEqual(false)
      })

      test('Should return false if session rating from coach is larger than 2', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Were you able to help them achieve their goal?',
            score: 3,
          }),
        ]
        const result = computeLowSessionRatingFromCoach(surveyResponses)
        expect(result).toEqual(false)
      })

      test('Should return true if session rating from coach is 2 or smaller', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Were you able to help them achieve their goal?',
            score: 2,
          }),
        ]
        const result = computeLowSessionRatingFromCoach(surveyResponses)
        expect(result).toEqual(true)
      })
    })
  })

  describe('computeReportedFlags', () => {
    test(`Should not contain ${UserSessionFlags.reported} flag if session is not reported`, () => {
      const studentId = getUuid()
      const session = buildSession({ studentId, reported: false })
      const result = computeReportedFlags(session)
      expect(result).not.toContain(UserSessionFlags.reported)
    })

    test(`Should contain ${UserSessionFlags.reported} flag when session is reported`, () => {
      const studentId = getUuid()
      const session = buildSession({ studentId, reported: true })
      const result = computeReportedFlags(session)
      expect(result).toContain(UserSessionFlags.reported)
    })
  })

  describe('computeSessionReviewReasonsFromFlags', () => {
    test(`Should not contain ${UserSessionFlags.absentStudent} review reason if student has not been absent 4 or more times`, () => {
      const flags = [UserSessionFlags.absentStudent]
      const studentId = getUuid()
      const studentUSM = buildUserSessionMetrics({
        userId: studentId,
        absentStudent: 3,
      })
      const reviewReasons = computeSessionReviewReasonsFromFlags(
        flags,
        studentUSM
      )
      expect(reviewReasons).toEqual([])
    })

    test(`Should contain ${UserSessionFlags.absentStudent} review reason if student has been absent 4 or more times`, () => {
      const flags = [UserSessionFlags.absentStudent]
      const studentId = getUuid()
      let studentUSM = buildUserSessionMetrics({
        userId: studentId,
        absentStudent: 4,
      })
      let reviewReasons = computeSessionReviewReasonsFromFlags(
        flags,
        studentUSM
      )
      expect(reviewReasons).toEqual([USER_SESSION_METRICS.absentStudent])

      studentUSM = buildUserSessionMetrics({
        userId: studentId,
        absentStudent: 5,
      })
      reviewReasons = computeSessionReviewReasonsFromFlags(flags, studentUSM)
      expect(reviewReasons).toEqual([USER_SESSION_METRICS.absentStudent])
    })

    test(`Should not contain ${UserSessionFlags.absentVolunteer} review reason if volunteer has not been absent 2 or more times`, () => {
      const flags = [UserSessionFlags.absentVolunteer]
      const studentId = getUuid()
      const studentUSM = buildUserSessionMetrics({
        userId: studentId,
      })
      const volunteerUSM = buildUserSessionMetrics({
        userId: studentId,
        absentVolunteer: 1,
      })
      const reviewReasons = computeSessionReviewReasonsFromFlags(
        flags,
        studentUSM,
        volunteerUSM
      )
      expect(reviewReasons).toEqual([])
    })

    test(`Should contain ${UserSessionFlags.absentVolunteer} review reason if volunteer has been absent 2 or more times`, () => {
      const flags = [UserSessionFlags.absentVolunteer]
      const studentId = getUuid()
      const studentUSM = buildUserSessionMetrics({
        userId: studentId,
      })
      let volunteerUSM = buildUserSessionMetrics({
        userId: studentId,
        absentVolunteer: 2,
      })
      let reviewReasons = computeSessionReviewReasonsFromFlags(
        flags,
        studentUSM,
        volunteerUSM
      )
      expect(reviewReasons).toEqual([USER_SESSION_METRICS.absentVolunteer])

      volunteerUSM = buildUserSessionMetrics({
        userId: studentId,
        absentVolunteer: 3,
      })
      reviewReasons = computeSessionReviewReasonsFromFlags(
        flags,
        studentUSM,
        volunteerUSM
      )
      expect(reviewReasons).toEqual([USER_SESSION_METRICS.absentVolunteer])
    })
  })

  describe('computeFeedbackReviewReasonsFromFlags', () => {
    test('Should have proper review flags set', () => {
      const flags = [
        UserSessionFlags.lowCoachRatingFromStudent,
        UserSessionFlags.lowSessionRatingFromStudent,
        UserSessionFlags.lowSessionRatingFromCoach,
        UserSessionFlags.rudeOrInappropriate,
        UserSessionFlags.onlyLookingForAnswers,
        UserSessionFlags.personalIdentifyingInfo,
        UserSessionFlags.gradedAssignment,
        UserSessionFlags.coachUncomfortable,
        UserSessionFlags.studentCrisis,
      ]

      const studentId = getUuid()
      let studentUSM = buildUserSessionMetrics({
        userId: studentId,
        rudeOrInappropriate: 2,
        onlyLookingForAnswers: 2,
      })
      let reviewReasons = computeFeedbackReviewReasonsFromFlags(
        flags,
        studentUSM
      )
      expect(reviewReasons).toEqual([
        USER_SESSION_METRICS.lowCoachRatingFromStudent,
        USER_SESSION_METRICS.lowSessionRatingFromStudent,
        USER_SESSION_METRICS.lowSessionRatingFromCoach,
        USER_SESSION_METRICS.rudeOrInappropriate,
        USER_SESSION_METRICS.onlyLookingForAnswers,
        USER_SESSION_METRICS.personalIdentifyingInfo,
        USER_SESSION_METRICS.gradedAssignment,
        USER_SESSION_METRICS.coachUncomfortable,
        USER_SESSION_METRICS.studentCrisis,
      ])

      studentUSM = buildUserSessionMetrics({
        userId: studentId,
        rudeOrInappropriate: 1,
        onlyLookingForAnswers: 1,
      })
      reviewReasons = computeFeedbackReviewReasonsFromFlags(flags, studentUSM)
      expect(reviewReasons).toEqual([
        USER_SESSION_METRICS.lowCoachRatingFromStudent,
        USER_SESSION_METRICS.lowSessionRatingFromStudent,
        USER_SESSION_METRICS.lowSessionRatingFromCoach,
        USER_SESSION_METRICS.personalIdentifyingInfo,
        USER_SESSION_METRICS.gradedAssignment,
        USER_SESSION_METRICS.coachUncomfortable,
        USER_SESSION_METRICS.studentCrisis,
      ])
    })
  })

  describe('computeReportedReviewReason', () => {
    test('Should have proper review flags set', () => {
      let flags = [UserSessionFlags.reported]
      let reviewReasons = computeReportedReviewReason(flags)
      expect(reviewReasons).toEqual([USER_SESSION_METRICS.reported])

      flags = []
      reviewReasons = computeReportedReviewReason(flags)
      expect(reviewReasons).toEqual([])
    })
  })

  describe('triggerSessionActions', () => {
    test(`Should not queue ${Jobs.EmailStudentAbsentWarning} if no ${UserSessionFlags.absentStudent} flag`, async () => {
      const sessionId = getUuid()
      const flags: UserSessionFlags[] = []
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentStudent: 1,
      })
      await triggerSessionActions(sessionId, flags, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailStudentAbsentWarning,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailStudentAbsentWarning} if studentUSM absentStudent does not equal 1`, async () => {
      const sessionId = getUuid()
      const flags = [UserSessionFlags.absentStudent]
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentStudent: 0,
      })
      await triggerSessionActions(sessionId, flags, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailStudentAbsentWarning,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should queue ${Jobs.EmailStudentAbsentWarning} if studentUSM absentStudent exactly 1`, async () => {
      const sessionId = getUuid()
      const flags = [UserSessionFlags.absentStudent]
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentStudent: 1,
      })
      await triggerSessionActions(sessionId, flags, studentUSM)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailStudentAbsentWarning,
        { sessionId }
      )
    })

    test(`Should not queue ${Jobs.EmailVolunteerAbsentStudentApology} if no ${UserSessionFlags.absentStudent} flag`, async () => {
      const sessionId = getUuid()
      const flags: UserSessionFlags[] = []
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentStudent: 1,
      })
      await triggerSessionActions(sessionId, flags, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentStudentApology,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailVolunteerAbsentStudentApology} if volunteerUSM does not exist`, async () => {
      const sessionId = getUuid()
      const flags = [UserSessionFlags.absentStudent]
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      await triggerSessionActions(sessionId, flags, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentStudentApology,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailVolunteerAbsentStudentApology} if volunteerUSM does not have absentStudent total equal to 1`, async () => {
      const sessionId = getUuid()
      const flags = [UserSessionFlags.absentStudent]
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      const volunteerUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentStudent: 3,
      })
      await triggerSessionActions(sessionId, flags, studentUSM, volunteerUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentStudentApology,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should queue ${Jobs.EmailVolunteerAbsentStudentApology} if volunteerUSM has absentStudent total equal to exactly 1`, async () => {
      const sessionId = getUuid()
      const flags = [UserSessionFlags.absentStudent]
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      const volunteerUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentStudent: 1,
      })
      await triggerSessionActions(sessionId, flags, studentUSM, volunteerUSM)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentStudentApology,
        { sessionId }
      )
    })

    test(`Should not queue ${Jobs.EmailVolunteerAbsentWarning} if no ${UserSessionFlags.absentVolunteer} flag`, async () => {
      const sessionId = getUuid()
      const flags: UserSessionFlags[] = []
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentVolunteer: 1,
      })
      await triggerSessionActions(sessionId, flags, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentWarning,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailVolunteerAbsentWarning} if volunteerUSM does not exist`, async () => {
      const sessionId = getUuid()
      const flags = [UserSessionFlags.absentVolunteer]
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      await triggerSessionActions(sessionId, flags, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentWarning,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailVolunteerAbsentWarning} if volunteerUSM does not have absentVolunteer total equal to 1`, async () => {
      const sessionId = getUuid()
      const flags = [UserSessionFlags.absentVolunteer]
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      const volunteerUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentVolunteer: 3,
      })
      await triggerSessionActions(sessionId, flags, studentUSM, volunteerUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentWarning,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should queue ${Jobs.EmailVolunteerAbsentWarning} if volunteerUSM has absentVolunteer total equal to exactly 1`, async () => {
      const sessionId = getUuid()
      const flags = [UserSessionFlags.absentVolunteer]
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      const volunteerUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentVolunteer: 1,
      })
      await triggerSessionActions(sessionId, flags, studentUSM, volunteerUSM)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentWarning,
        { sessionId }
      )
    })

    test(`Should not queue ${Jobs.EmailStudentAbsentVolunteerApology} if no ${UserSessionFlags.absentVolunteer} flag`, async () => {
      const sessionId = getUuid()
      const flags: UserSessionFlags[] = []
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentVolunteer: 1,
      })
      await triggerSessionActions(sessionId, flags, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailStudentAbsentVolunteerApology,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailStudentAbsentVolunteerApology} if studentUSM does not have absentVolunteer total equal to 1`, async () => {
      const sessionId = getUuid()
      const flags = [UserSessionFlags.absentVolunteer]

      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      const volunteerUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentVolunteer: 3,
      })
      await triggerSessionActions(sessionId, flags, studentUSM, volunteerUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailStudentAbsentVolunteerApology,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should queue ${Jobs.EmailStudentAbsentVolunteerApology} if studentUSM has absentVolunteer total equal to exactly 1`, async () => {
      const sessionId = getUuid()
      const flags = [UserSessionFlags.absentVolunteer]
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentVolunteer: 1,
      })
      const volunteerUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      await triggerSessionActions(sessionId, flags, studentUSM, volunteerUSM)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailStudentAbsentVolunteerApology,
        { sessionId }
      )
    })

    test(`Should not queue ${Jobs.EmailStudentUnmatchedApology} if no ${UserSessionFlags.hasBeenUnmatched} flag`, async () => {
      const sessionId = getUuid()
      const flags: UserSessionFlags[] = []
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        hasBeenUnmatched: 1,
      })
      await triggerSessionActions(sessionId, flags, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailStudentUnmatchedApology,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailStudentUnmatchedApology} if studentUSM does not have hasBeenUnmatched total equal to 1`, async () => {
      const sessionId = getUuid()
      const flags = [UserSessionFlags.hasBeenUnmatched]
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        hasBeenUnmatched: 3,
      })
      await triggerSessionActions(sessionId, flags, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailStudentUnmatchedApology,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should queue ${Jobs.EmailStudentUnmatchedApology} if studentUSM has hasBeenUnmatched total equal to exactly 1`, async () => {
      const sessionId = getUuid()
      const flags = [UserSessionFlags.hasBeenUnmatched]
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        hasBeenUnmatched: 1,
      })
      await triggerSessionActions(sessionId, flags, studentUSM)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailStudentUnmatchedApology,
        { sessionId }
      )
    })
  })

  describe('triggerFeedbackActions', () => {
    test(`Should not queue ${Jobs.EmailStudentOnlyLookingForAnswers} if no ${UserSessionFlags.onlyLookingForAnswers} flag`, async () => {
      const studentId = getUuid()
      const session = buildSession({ studentId })
      const sessionId = session.id
      mockedSessionRepo.getSessionById.mockResolvedValue(session)

      const flags: UserSessionFlags[] = []
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        onlyLookingForAnswers: 1,
      })
      await triggerFeedbackActions(sessionId, flags, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailStudentOnlyLookingForAnswers,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailStudentOnlyLookingForAnswers} if student USM onlyLookingForAnswers is not equal to 1`, async () => {
      const studentId = getUuid()
      const session = buildSession({ studentId })
      const sessionId = session.id
      mockedSessionRepo.getSessionById.mockResolvedValue(session)

      const flags = [UserSessionFlags.onlyLookingForAnswers]
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        onlyLookingForAnswers: 3,
      })
      await triggerFeedbackActions(sessionId, flags, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailStudentOnlyLookingForAnswers,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should queue ${Jobs.EmailStudentOnlyLookingForAnswers} if studentUSM has onlyLookingForAnswers total equal to 1`, async () => {
      const studentId = getUuid()
      const session = buildSession({ studentId, reported: true })
      const sessionId = session.id
      mockedSessionRepo.getSessionById.mockResolvedValue(session)

      const flags = [UserSessionFlags.onlyLookingForAnswers]
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        onlyLookingForAnswers: 1,
      })
      await triggerFeedbackActions(sessionId, flags, studentUSM)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailStudentOnlyLookingForAnswers,
        { sessionId }
      )
    })

    test(`Should not queue ${Jobs.EmailSessionReported} if no ${UserSessionFlags.studentCrisis} flag`, async () => {
      const studentId = getUuid()
      const volunteerId = getUuid()
      const session = buildSession({ studentId, volunteerId })
      const sessionId = session.id
      mockedSessionRepo.getSessionById.mockResolvedValue(session)

      const flags: UserSessionFlags[] = []
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      await triggerFeedbackActions(sessionId, flags, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailSessionReported,
        {
          sessionId,
          isBanReason: false,
          reportReason: SESSION_REPORT_REASON.STUDENT_SAFETY,
          reportedBy: session.volunteerId,
          userId: session.studentId,
        },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailSessionReported} if has ${UserSessionFlags.studentCrisis} flag, but session was already reported`, async () => {
      const studentId = getUuid()
      const volunteerId = getUuid()
      const session = buildSession({ studentId, volunteerId, reported: true })
      const sessionId = session.id
      mockedSessionRepo.getSessionById.mockResolvedValue(session)

      const flags = [UserSessionFlags.studentCrisis]
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      await triggerFeedbackActions(sessionId, flags, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailSessionReported,
        {
          sessionId,
          isBanReason: false,
          reportReason: SESSION_REPORT_REASON.STUDENT_SAFETY,
          reportedBy: session.volunteerId,
          userId: session.studentId,
        },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailSessionReported} if has ${UserSessionFlags.studentCrisis} flag and session was not already reported`, async () => {
      const studentId = getUuid()
      const volunteerId = getUuid()
      const session = buildSession({ studentId, volunteerId, reported: false })
      const sessionId = session.id
      mockedSessionRepo.getSessionById.mockResolvedValue(session)

      const flags = [UserSessionFlags.studentCrisis]
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      await triggerFeedbackActions(sessionId, flags, studentUSM)
      expect(QueueService.add).toHaveBeenCalledWith(Jobs.EmailSessionReported, {
        sessionId,
        isBanReason: false,
        reportReason: SESSION_REPORT_REASON.STUDENT_SAFETY,
        reportedBy: session.volunteerId,
        userId: session.studentId,
      })
    })
  })

  describe('Test flagging for review', () => {
    test("Set session for review if review reasons aren't all excluded from review", async () => {
      const studentId = getUuid()
      const session = buildSession({
        studentId,
        reported: true,
      })
      const userMetrics = buildUserSessionMetrics({
        userId: session.studentId,
        onlyLookingForAnswers: 3,
        absentStudent: 1,
        absentVolunteer: 1,
      })

      mockedSessionRepo.getSessionById.mockResolvedValue(session)

      mockedUserSessionMetricsRepo.getUserSessionMetricsByUserId.mockResolvedValue(
        userMetrics
      )

      await processMetrics(
        session.id,
        {
          computeSessionFlags: mockedComputeSessionFlags,
          computeReviewReasons: mockedComputeReviewReasons,
        },
        new Set<UserSessionFlags>([UserSessionFlags.absentStudent])
      )

      expect(
        mockedSessionRepo.updateSessionReviewReasonsById
      ).toHaveBeenCalledWith(
        session.id,
        [
          UserSessionFlags.absentStudent,
          UserSessionFlags.coachReportedStudentDm,
        ],
        false
      )
    })

    test("Don't set session for review if review reasons are all excluded from review", async () => {
      const studentId = getUuid()
      const session = buildSession({
        studentId,
        reported: true,
      })
      const userMetrics = buildUserSessionMetrics({
        userId: session.studentId,
        onlyLookingForAnswers: 3,
        absentStudent: 1,
        absentVolunteer: 1,
      })

      mockedSessionRepo.getSessionById.mockResolvedValue(session)

      mockedUserSessionMetricsRepo.getUserSessionMetricsByUserId.mockResolvedValue(
        userMetrics
      )

      await processMetrics(
        session.id,
        {
          computeSessionFlags: mockedComputeSessionFlags,
          computeReviewReasons: mockedOnlyExcludedReviewReasons,
        },
        new Set<UserSessionFlags>([UserSessionFlags.absentStudent])
      )

      expect(
        mockedSessionRepo.updateSessionReviewReasonsById
      ).toHaveBeenCalledTimes(0)
    })
  })
})
