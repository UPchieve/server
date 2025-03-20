import { mocked } from 'jest-mock'
import moment from 'moment'
import {
  buildMessageForFrontend,
  buildSession,
  buildSurveyResponse,
  buildUserSessionMetrics,
  getSentence,
} from '../mocks/generate'
import { SESSION_REPORT_REASON, USER_SESSION_METRICS } from '../../constants'
import { getUuid } from '../../models/pgUtils'
import * as SessionRepo from '../../models/Session'
import * as SessionMetricsRepo from '../../models/SessionMetrics'
import {
  getPostsessionSurveyResponsesForSessionMetrics,
  PostsessionSurveyResponse,
} from '../../models/Survey'
import QueueService from '../../services/QueueService'
import {
  computeMetricsForSession,
  computeMetricsForFeedbackSaved,
  computeMetricsForReportedSession,
  computeSessionFlagsFromMetrics,
  computeFeedbackFlagsFromMetrics,
  computeReportedFlagsFromMetrics,
  computeSessionReviewReasonsFromMetrics,
  computeFeedbackReviewReasonsFromMetrics,
  computeReportedReviewReason,
  triggerSessionActions,
  triggerFeedbackActions,
  computeLowCoachRatingFromStudent,
  computeLowSessionRatingFromStudent,
  computeLowSessionRatingFromCoach,
} from '../../services/SessionMetricsService'
import { Jobs } from '../../worker/jobs'

jest.mock('../../models/Session')
jest.mock('../../models/SessionMetrics')
jest.mock('../../models/Survey')
jest.mock('../../services/QueueService')
jest.mock('../../services/SessionService')

const mockedSessionRepo = mocked(SessionRepo)
const mockedGetPostsessionSurveyResponsesForSessionMetrics = mocked(
  getPostsessionSurveyResponsesForSessionMetrics
)
const volunteerJoinedAt = new Date('2025-01-01 00:00:00.000000+00')

describe('SessionMetricsService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('computeMetricsForSession', () => {
    test('Should have appropriate properties on the session metrics', async () => {
      const studentId = getUuid()
      const volunteerId = getUuid()
      const session = buildSession({
        studentId,
        volunteerId,
      })
      const messages = [
        buildMessageForFrontend({
          user: studentId,
        }),
        buildMessageForFrontend({
          user: volunteerId,
        }),
      ]
      mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

      const result = await computeMetricsForSession(session)
      expect(mockedSessionRepo.getMessagesForFrontend).toHaveBeenCalledWith(
        session.id
      )
      expect(result).toHaveProperty('absentStudent')
      expect(result).toHaveProperty('absentVolunteer')
      expect(result).toHaveProperty('hasBeenUnmatched')
    })

    describe('computeAbsentStudentMetric', () => {
      test('absentStudent should be 0 if no volunteer joined', async () => {
        const studentId = getUuid()
        const session = buildSession({
          studentId,
        })
        const messages: SessionRepo.MessageForFrontend[] = []
        mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

        const result = await computeMetricsForSession(session)
        expect(result.absentStudent).toEqual(0)
      })

      test('absentStudent should be 0 if volunteer doesnt wait long enough to give student chance to respond', async () => {
        const studentId = getUuid()
        const volunteerId = getUuid()
        const session = buildSession({
          studentId,
          volunteerId,
          volunteerJoinedAt,
          endedAt: moment(volunteerJoinedAt).add(5, 'minutes').toDate(),
        })
        const messages: SessionRepo.MessageForFrontend[] = []
        mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

        const result = await computeMetricsForSession(session)
        expect(result.absentStudent).toEqual(0)
      })

      test('absentStudent should be 0 if student sent messages after volunteer joined', async () => {
        const studentId = getUuid()
        const volunteerId = getUuid()
        const session = buildSession({
          studentId,
          volunteerId,
          volunteerJoinedAt,
          endedAt: moment(volunteerJoinedAt).add(20, 'minutes').toDate(),
        })
        const messages: SessionRepo.MessageForFrontend[] = [
          buildMessageForFrontend({
            user: studentId,
            contents: getSentence(),
            createdAt: moment(volunteerJoinedAt).add(2, 'minutes').toDate(),
          }),
        ]
        mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

        const result = await computeMetricsForSession(session)
        expect(result.absentStudent).toEqual(0)
      })

      test('absentStudent should be 1 if student did not send messages after volunteer joined', async () => {
        const studentId = getUuid()
        const volunteerId = getUuid()
        const volunteerJoinedAt = new Date('2025-01-01 00:00:00.000000+00')
        const session = buildSession({
          studentId,
          volunteerId,
          volunteerJoinedAt,
          endedAt: moment(volunteerJoinedAt).add(20, 'minutes').toDate(),
        })
        const messages: SessionRepo.MessageForFrontend[] = []
        mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

        const result = await computeMetricsForSession(session)
        expect(result.absentStudent).toEqual(1)
      })
    })

    describe('computeAbsentVolunteerMetric', () => {
      test('absentVolunteer should be 0 if no volunteer joined', async () => {
        const studentId = getUuid()
        const session = buildSession({
          studentId,
        })
        const messages: SessionRepo.MessageForFrontend[] = []
        mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

        const result = await computeMetricsForSession(session)
        expect(result.absentVolunteer).toEqual(0)
      })

      test('absentVolunteer should be 0 if student doesnt wait long enough to give volunteer chance to respond', async () => {
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

        const result = await computeMetricsForSession(session)
        expect(result.absentVolunteer).toEqual(0)
      })

      test('absentVolunteer should be 0 if volunteer sent messages after volunteer joined', async () => {
        const studentId = getUuid()
        const volunteerId = getUuid()
        const session = buildSession({
          studentId,
          volunteerId,
          volunteerJoinedAt,
          endedAt: moment(volunteerJoinedAt).add(20, 'minutes').toDate(),
        })
        const messages: SessionRepo.MessageForFrontend[] = [
          buildMessageForFrontend({
            user: volunteerId,
            contents: getSentence(),
            createdAt: moment(volunteerJoinedAt).add(2, 'minutes').toDate(),
          }),
        ]
        mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

        const result = await computeMetricsForSession(session)
        expect(result.absentVolunteer).toEqual(0)
      })

      test('absentVolunteer should be 1 if volunteer did not send messages after joining session', async () => {
        const studentId = getUuid()
        const volunteerId = getUuid()
        const session = buildSession({
          studentId,
          volunteerId,
          volunteerJoinedAt,
          endedAt: moment(volunteerJoinedAt).add(20, 'minutes').toDate(),
        })
        const messages: SessionRepo.MessageForFrontend[] = []
        mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

        const result = await computeMetricsForSession(session)
        expect(result.absentVolunteer).toEqual(1)
      })
    })

    describe('computeHasBeenUnmatchedMetric', () => {
      test('hasBeenUnmatched should be 0 if no volunteer joined the session', async () => {
        const studentId = getUuid()
        const volunteerId = getUuid()
        const session = buildSession({
          studentId,
          volunteerId,
        })
        const messages: SessionRepo.MessageForFrontend[] = []
        mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

        const result = await computeMetricsForSession(session)
        expect(result.hasBeenUnmatched).toEqual(0)
      })

      test('hasBeenUnmatched should be 1 if no volunteer joined the session', async () => {
        const studentId = getUuid()
        const session = buildSession({
          studentId,
        })
        const messages: SessionRepo.MessageForFrontend[] = []
        mockedSessionRepo.getMessagesForFrontend.mockResolvedValueOnce(messages)

        const result = await computeMetricsForSession(session)
        expect(result.hasBeenUnmatched).toEqual(1)
      })
    })
  })

  describe('computeMetricsForFeedbackSaved', () => {
    test('Should compute feedback metrics based on survey responses', async () => {
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

      const result = await computeMetricsForFeedbackSaved(session)
      expect(
        mockedGetPostsessionSurveyResponsesForSessionMetrics
      ).toHaveBeenCalledWith(session.id)
      expect(result).toEqual({
        lowCoachRatingFromStudent: 1,
        lowSessionRatingFromStudent: 1,
        lowSessionRatingFromCoach: 1,
        rudeOrInappropriate: 1,
        onlyLookingForAnswers: 1,
        commentFromStudent: 1,
        commentFromVolunteer: 1,
        hasHadTechnicalIssues: 1,
        personalIdentifyingInfo: 1,
        gradedAssignment: 1,
        coachUncomfortable: 1,
        studentCrisis: 1,
      })
    })

    describe('computeLowCoachRatingFromStudent', () => {
      test('Should return 0 if question not found', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Test question',
            score: 1,
          }),
        ]
        const result = computeLowCoachRatingFromStudent(surveyResponses)
        expect(result).toBe(0)
      })

      test('Should return 0 if coach rating from student is larger than 2', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Overall, how supportive was your coach today?',
            score: 3,
          }),
        ]
        const result = computeLowCoachRatingFromStudent(surveyResponses)
        expect(result).toBe(0)
      })

      test('Should return 0 if coach rating from student is 2 or smaller', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Overall, how supportive was your coach today?',
            score: 1,
          }),
        ]
        const result = computeLowCoachRatingFromStudent(surveyResponses)
        expect(result).toBe(1)
      })
    })

    describe('computeLowSessionRatingFromStudent', () => {
      test('Should return 0 if question not found', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Test question',
            score: 1,
          }),
        ]
        const result = computeLowSessionRatingFromStudent(surveyResponses)
        expect(result).toBe(0)
      })

      test('Should return 0 if session rating from student is larger than 2', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Did UPchieve help you achieve your goal?',
            score: 3,
          }),
        ]
        const result = computeLowSessionRatingFromStudent(surveyResponses)
        expect(result).toBe(0)
      })

      test('Should return 0 if session rating from student is 2 or smaller', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Did UPchieve help you achieve your goal?',
            score: 2,
          }),
        ]
        const result = computeLowSessionRatingFromStudent(surveyResponses)
        expect(result).toBe(1)
      })
    })

    describe('computeLowSessionRatingFromCoach', () => {
      test('Should return 0 if question not found', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Test question',
            score: 1,
          }),
        ]
        const result = computeLowSessionRatingFromCoach(surveyResponses)
        expect(result).toBe(0)
      })

      test('Should return 0 if session rating from coach is larger than 2', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Were you able to help them achieve their goal?',
            score: 3,
          }),
        ]
        const result = computeLowSessionRatingFromCoach(surveyResponses)
        expect(result).toBe(0)
      })

      test('Should return 0 if session rating from coach is 2 or smaller', () => {
        const surveyResponses: PostsessionSurveyResponse[] = [
          buildSurveyResponse({
            questionText: 'Were you able to help them achieve their goal?',
            score: 2,
          }),
        ]
        const result = computeLowSessionRatingFromCoach(surveyResponses)
        expect(result).toBe(1)
      })
    })
  })

  describe('computeMetricsForReportedSession', () => {
    test('should return reported metric of 0 if session is not reported', () => {
      const studentId = getUuid()
      const session = buildSession({ studentId, reported: false })
      const result = computeMetricsForReportedSession(session)
      expect(result.reported).toBe(0)
    })

    test('Should return reported metric of 1 when session is reported', () => {
      const studentId = getUuid()
      const session = buildSession({ studentId, reported: true })
      const result = computeMetricsForReportedSession(session)
      expect(result.reported).toBe(1)
    })
  })

  describe('computeSessionFlagsFromMetrics', () => {
    test('should return correct flags', () => {
      const metrics: Partial<SessionMetricsRepo.SessionMetrics> = {
        absentStudent: 1,
        absentVolunteer: 1,
      }
      const flags = computeSessionFlagsFromMetrics(metrics)
      expect(flags).toEqual([
        USER_SESSION_METRICS.absentStudent,
        USER_SESSION_METRICS.absentVolunteer,
      ])

      const metricsTwo: Partial<SessionMetricsRepo.SessionMetrics> = {
        absentStudent: 0,
        absentVolunteer: 0,
      }
      const flagsTwo = computeSessionFlagsFromMetrics(metricsTwo)
      expect(flagsTwo).toEqual([])
    })
  })

  describe('computeFeedbackFlagsFromMetrics', () => {
    test('computeFeedbackFlagsFromMetrics returns correct flags', () => {
      const metrics = {
        lowCoachRatingFromStudent: 1,
        lowSessionRatingFromStudent: 1,
        lowSessionRatingFromCoach: 1,
        rudeOrInappropriate: 1,
        onlyLookingForAnswers: 1,
        commentFromStudent: 1,
        commentFromVolunteer: 1,
        personalIdentifyingInfo: 1,
        gradedAssignment: 1,
        coachUncomfortable: 1,
        studentCrisis: 1,
      } as SessionMetricsRepo.SessionMetrics
      const flags = computeFeedbackFlagsFromMetrics(metrics)
      expect(flags).toEqual([
        USER_SESSION_METRICS.lowCoachRatingFromStudent,
        USER_SESSION_METRICS.lowSessionRatingFromStudent,
        USER_SESSION_METRICS.lowSessionRatingFromCoach,
        USER_SESSION_METRICS.rudeOrInappropriate,
        USER_SESSION_METRICS.onlyLookingForAnswers,
        USER_SESSION_METRICS.commentFromStudent,
        USER_SESSION_METRICS.commentFromVolunteer,
        USER_SESSION_METRICS.personalIdentifyingInfo,
        USER_SESSION_METRICS.gradedAssignment,
        USER_SESSION_METRICS.coachUncomfortable,
        USER_SESSION_METRICS.studentCrisis,
      ])

      const metricsTwo = {
        lowCoachRatingFromStudent: 0,
        lowSessionRatingFromStudent: 1,
        lowSessionRatingFromCoach: 1,
        rudeOrInappropriate: 0,
        onlyLookingForAnswers: 0,
        commentFromStudent: 0,
        commentFromVolunteer: 0,
        personalIdentifyingInfo: 0,
        gradedAssignment: 0,
        coachUncomfortable: 0,
        studentCrisis: 0,
      } as SessionMetricsRepo.SessionMetrics
      const flagsTwo = computeFeedbackFlagsFromMetrics(metricsTwo)
      expect(flagsTwo).toEqual([
        USER_SESSION_METRICS.lowSessionRatingFromStudent,
        USER_SESSION_METRICS.lowSessionRatingFromCoach,
      ])
    })
  })

  describe('computeReportedFlagsFromMetrics', () => {
    test('computeReportedFlagsFromMetrics returns correct flags', () => {
      const metrics = {
        reported: 1,
      } as SessionMetricsRepo.SessionMetrics
      const flags = computeReportedFlagsFromMetrics(metrics)
      expect(flags).toEqual([USER_SESSION_METRICS.reported])

      const metricsTwo = {
        reported: 0,
      } as SessionMetricsRepo.SessionMetrics
      const flagsTwo = computeReportedFlagsFromMetrics(metricsTwo)
      expect(flagsTwo).toEqual([])
    })
  })

  describe('computeSessionReviewReasonsFromMetrics', () => {
    test('absentStudent should not be a review reason if student has not been absent 4 or more times', () => {
      const metrics = {
        absentStudent: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentId = getUuid()
      const studentUSM = buildUserSessionMetrics({
        userId: studentId,
        absentStudent: 3,
      })
      const reviewReasons = computeSessionReviewReasonsFromMetrics(
        metrics,
        studentUSM
      )
      expect(reviewReasons).toEqual([])
    })

    test('absentStudent review reason if student has been absent 4 or more times', () => {
      const metrics = {
        absentStudent: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentId = getUuid()
      let studentUSM = buildUserSessionMetrics({
        userId: studentId,
        absentStudent: 4,
      })
      let reviewReasons = computeSessionReviewReasonsFromMetrics(
        metrics,
        studentUSM
      )
      expect(reviewReasons).toEqual([USER_SESSION_METRICS.absentStudent])

      studentUSM = buildUserSessionMetrics({
        userId: studentId,
        absentStudent: 5,
      })
      reviewReasons = computeSessionReviewReasonsFromMetrics(
        metrics,
        studentUSM
      )
      expect(reviewReasons).toEqual([USER_SESSION_METRICS.absentStudent])
    })

    test('absentVolunteer should not be a review reason if volunteer has not been absent 2 or more times', () => {
      const metrics = {
        absentVolunteer: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentId = getUuid()
      const studentUSM = buildUserSessionMetrics({
        userId: studentId,
      })
      const volunteerUSM = buildUserSessionMetrics({
        userId: studentId,
        absentVolunteer: 1,
      })
      const reviewReasons = computeSessionReviewReasonsFromMetrics(
        metrics,
        studentUSM,
        volunteerUSM
      )
      expect(reviewReasons).toEqual([])
    })

    test('absentVolunteer review reason if volunteer has been absent 2 or more times', () => {
      const metrics = {
        absentVolunteer: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentId = getUuid()
      const studentUSM = buildUserSessionMetrics({
        userId: studentId,
      })
      let volunteerUSM = buildUserSessionMetrics({
        userId: studentId,
        absentVolunteer: 2,
      })
      let reviewReasons = computeSessionReviewReasonsFromMetrics(
        metrics,
        studentUSM,
        volunteerUSM
      )
      expect(reviewReasons).toEqual([USER_SESSION_METRICS.absentVolunteer])

      volunteerUSM = buildUserSessionMetrics({
        userId: studentId,
        absentVolunteer: 3,
      })
      reviewReasons = computeSessionReviewReasonsFromMetrics(
        metrics,
        studentUSM,
        volunteerUSM
      )
      expect(reviewReasons).toEqual([USER_SESSION_METRICS.absentVolunteer])
    })
  })

  describe('computeFeedbackReviewReasonsFromMetrics', () => {
    test('Should have proper review flags set', () => {
      const metrics = {
        lowCoachRatingFromStudent: 1,
        lowSessionRatingFromStudent: 1,
        lowSessionRatingFromCoach: 1,
        rudeOrInappropriate: 1,
        onlyLookingForAnswers: 1,
        personalIdentifyingInfo: 1,
        gradedAssignment: 1,
        coachUncomfortable: 1,
        studentCrisis: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentId = getUuid()
      let studentUSM = buildUserSessionMetrics({
        userId: studentId,
        rudeOrInappropriate: 2,
        onlyLookingForAnswers: 2,
      })
      let reviewReasons = computeFeedbackReviewReasonsFromMetrics(
        metrics,
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
      reviewReasons = computeFeedbackReviewReasonsFromMetrics(
        metrics,
        studentUSM
      )
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
      let metrics = {
        reported: 1,
      } as SessionMetricsRepo.SessionMetrics
      let reviewReasons = computeReportedReviewReason(metrics)
      expect(reviewReasons).toEqual([USER_SESSION_METRICS.reported])

      metrics = {
        reported: 0,
      } as SessionMetricsRepo.SessionMetrics
      reviewReasons = computeReportedReviewReason(metrics)
      expect(reviewReasons).toEqual([])
    })
  })

  describe('triggerSessionActions', () => {
    test(`Should not queue ${Jobs.EmailStudentAbsentWarning}if no session metrics for absentStudent`, async () => {
      const sessionId = getUuid()
      const metrics = {
        sessionId,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      await triggerSessionActions(metrics, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailStudentAbsentWarning,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailStudentAbsentWarning} if studentUSM absentStudent does not equal 1`, async () => {
      const sessionId = getUuid()
      const metrics = {
        sessionId,
        absentStudent: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentStudent: 0,
      })
      await triggerSessionActions(metrics, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailStudentAbsentWarning,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should queue ${Jobs.EmailStudentAbsentWarning} if studentUSM absentStudent exactly 1`, async () => {
      const sessionId = getUuid()
      const metrics = {
        sessionId,
        absentStudent: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentStudent: 1,
      })
      await triggerSessionActions(metrics, studentUSM)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailStudentAbsentWarning,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailVolunteerAbsentStudentApology} if no session metrics for absentStudent`, async () => {
      const sessionId = getUuid()
      const metrics = {
        sessionId,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      await triggerSessionActions(metrics, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentStudentApology,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailVolunteerAbsentStudentApology} if volunteerUSM does not exist`, async () => {
      const sessionId = getUuid()
      const metrics = {
        sessionId,
        absentStudent: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      await triggerSessionActions(metrics, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentStudentApology,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailVolunteerAbsentStudentApology} if volunteerUSM does not have absentStudent total equal to 1`, async () => {
      const sessionId = getUuid()
      const metrics = {
        sessionId,
        absentStudent: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      const volunteerUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentStudent: 3,
      })
      await triggerSessionActions(metrics, studentUSM, volunteerUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentStudentApology,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should queue ${Jobs.EmailVolunteerAbsentStudentApology} if volunteerUSM has absentStudent total equal to exactly 1`, async () => {
      const sessionId = getUuid()
      const metrics = {
        sessionId,
        absentStudent: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      const volunteerUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentStudent: 1,
      })
      await triggerSessionActions(metrics, studentUSM, volunteerUSM)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentStudentApology,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailVolunteerAbsentWarning} if no session metrics for absentVolunteer`, async () => {
      const sessionId = getUuid()
      const metrics = {
        sessionId,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      await triggerSessionActions(metrics, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentWarning,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailVolunteerAbsentWarning} if volunteerUSM does not exist`, async () => {
      const sessionId = getUuid()
      const metrics = {
        sessionId,
        absentVolunteer: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      await triggerSessionActions(metrics, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentWarning,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailVolunteerAbsentWarning} if volunteerUSM does not have absentVolunteer total equal to 1`, async () => {
      const sessionId = getUuid()
      const metrics = {
        sessionId,
        absentVolunteer: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      const volunteerUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentVolunteer: 3,
      })
      await triggerSessionActions(metrics, studentUSM, volunteerUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentWarning,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should queue ${Jobs.EmailVolunteerAbsentWarning} if volunteerUSM has absentVolunteer total equal to exactly 1`, async () => {
      const sessionId = getUuid()
      const metrics = {
        sessionId,
        absentVolunteer: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      const volunteerUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentVolunteer: 1,
      })
      await triggerSessionActions(metrics, studentUSM, volunteerUSM)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailVolunteerAbsentWarning,
        { sessionId },
        expect.anything()
      )
    })
    //

    test(`Should not queue ${Jobs.EmailStudentAbsentVolunteerApology} if no session metrics for absentVolunteer`, async () => {
      const sessionId = getUuid()
      const metrics = {
        sessionId,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      await triggerSessionActions(metrics, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailStudentAbsentVolunteerApology,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailStudentAbsentVolunteerApology} if studentUSM does not have absentVolunteer total equal to 1`, async () => {
      const sessionId = getUuid()
      const metrics = {
        sessionId,
        absentVolunteer: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      const volunteerUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentVolunteer: 3,
      })
      await triggerSessionActions(metrics, studentUSM, volunteerUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailStudentAbsentVolunteerApology,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should queue ${Jobs.EmailStudentAbsentVolunteerApology} if volunteerUSM has absentVolunteer total equal to exactly 1`, async () => {
      const sessionId = getUuid()
      const metrics = {
        sessionId,
        absentVolunteer: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        absentVolunteer: 1,
      })
      const volunteerUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      await triggerSessionActions(metrics, studentUSM, volunteerUSM)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailStudentAbsentVolunteerApology,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailStudentUnmatchedApology} if no session metrics for hasBeenUnmatched`, async () => {
      const sessionId = getUuid()
      const metrics = {
        sessionId,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      await triggerSessionActions(metrics, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailStudentUnmatchedApology,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailStudentUnmatchedApology} if studentUSM does not have hasBeenUnmatched total equal to 1`, async () => {
      const sessionId = getUuid()
      const metrics = {
        sessionId,
        hasBeenUnmatched: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        hasBeenUnmatched: 3,
      })
      await triggerSessionActions(metrics, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailStudentUnmatchedApology,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should queue ${Jobs.EmailStudentUnmatchedApology} if volunteerUSM has hasBeenUnmatched total equal to exactly 1`, async () => {
      const sessionId = getUuid()
      const metrics = {
        sessionId,
        hasBeenUnmatched: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        hasBeenUnmatched: 1,
      })
      await triggerSessionActions(metrics, studentUSM)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailStudentUnmatchedApology,
        { sessionId },
        expect.anything()
      )
    })
  })

  describe('triggerFeedbackActions', () => {
    test(`Should not queue ${Jobs.EmailStudentOnlyLookingForAnswers} if no session metrics for onlyLookingForAnswers or it's does not have a total of 1`, async () => {
      const studentId = getUuid()
      const session = buildSession({ studentId })
      const sessionId = session.id
      mockedSessionRepo.getSessionById.mockResolvedValue(session)

      let metrics = {
        sessionId,
      } as SessionMetricsRepo.SessionMetrics
      let studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      await triggerFeedbackActions(metrics, studentUSM)
      expect(QueueService.add).not.toHaveBeenCalledWith(
        Jobs.EmailStudentOnlyLookingForAnswers,
        { sessionId },
        expect.anything()
      )

      metrics = {
        sessionId,
        onlyLookingForAnswers: 1,
      } as SessionMetricsRepo.SessionMetrics
      studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        onlyLookingForAnswers: 3,
      })
      await triggerFeedbackActions(metrics, studentUSM)
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

      const metrics = {
        sessionId,
        onlyLookingForAnswers: 1,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
        onlyLookingForAnswers: 1,
      })
      await triggerFeedbackActions(metrics, studentUSM)
      expect(QueueService.add).toHaveBeenCalledWith(
        Jobs.EmailStudentOnlyLookingForAnswers,
        { sessionId },
        expect.anything()
      )
    })

    test(`Should not queue ${Jobs.EmailSessionReported} if session has been reported`, async () => {
      const studentId = getUuid()
      const volunteerId = getUuid()
      const session = buildSession({ studentId, reported: true, volunteerId })
      const sessionId = session.id
      mockedSessionRepo.getSessionById.mockResolvedValue(session)

      let metrics = {
        sessionId,
      } as SessionMetricsRepo.SessionMetrics
      let studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      await triggerFeedbackActions(metrics, studentUSM)
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

    test(`Should not queue ${Jobs.EmailSessionReported} if session has been reported`, async () => {
      const studentId = getUuid()
      const volunteerId = getUuid()
      const session = buildSession({ studentId, reported: false, volunteerId })
      const sessionId = session.id
      mockedSessionRepo.getSessionById.mockResolvedValue(session)

      const metrics = {
        sessionId,
      } as SessionMetricsRepo.SessionMetrics
      const studentUSM = buildUserSessionMetrics({
        userId: getUuid(),
      })
      await triggerFeedbackActions(metrics, studentUSM)
      expect(QueueService.add).toHaveBeenCalledWith(
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
  })
})
