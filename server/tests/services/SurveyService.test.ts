import { mocked } from 'jest-mock'
import * as SurveyService from '../../services/SurveyService'
import * as UserService from '../../services/UserService'
import * as UserRolesService from '../../services/UserRolesService'
import * as SurveyRepo from '../../models/Survey/queries'
import * as UserRepo from '../../models/User/queries'
import * as SessionRepo from '../../models/Session/queries'
import {
  buildPostsessionSurveyGoalResponse,
  buildSession,
  buildSimpleSurveyResponse,
  buildUserSurvey,
  buildUserSurveySubmission,
} from '../mocks/generate'
import { getDbUlid } from '../../models/pgUtils'
import { InputError } from '../../models/Errors'
import { FEEDBACK_EVENTS } from '../../constants'
import { emitter } from '../../services/EventsService'
import { Session } from '../../models/Session'
import { UserContactInfo } from '../../models/User'
import { RoleContext } from '../../services/UserRolesService'
import { PostsessionSurveyGoalResponse } from '../../models/Survey'

jest.mock('../../models/Survey/queries')
jest.mock('../../models/User/queries')
jest.mock('../../models/Session/queries')
jest.mock('../../services/UserService')
jest.mock('../../services/UserRolesService')

const mockedSurveyRepo = mocked(SurveyRepo)
const mockedUserRepo = mocked(UserRepo)
const mockedSessionRepo = mocked(SessionRepo)
const mockedUserService = mocked(UserService)
const mockedUserRolesService = mocked(UserRolesService)

beforeEach(async () => {
  jest.resetAllMocks()
})

describe('getContextSharingForVolunteer', () => {
  test('Should get session context sharing for volunteer', async () => {
    const mockedSurveyReponse = [buildSimpleSurveyResponse()]
    const mockTotalSessions = 2
    const mockSession = await buildSession({ studentId: getDbUlid() })
    mockedSurveyRepo.getPresessionSurveyResponse.mockResolvedValueOnce(
      mockedSurveyReponse
    )
    mockedUserRepo.getTotalSessionsByUserId.mockResolvedValueOnce(
      mockTotalSessions
    )
    mockedSessionRepo.getSessionById.mockResolvedValueOnce(mockSession)

    const result =
      await SurveyService.getContextSharingForVolunteer(getDbUlid())

    const expected = {
      responses: mockedSurveyReponse,
      totalStudentSessions: mockTotalSessions,
    }
    expect(result).toEqual(expected)
  })
})

describe('saveUserSurvey', () => {
  test('Should throw InputError if user survey submissions are not an array', async () => {
    const sessionId = getDbUlid()
    const userSurvey = buildUserSurvey({
      sessionId,
    })
    const submissions = buildUserSurveySubmission({
      responseChoiceId: 1,
      questionId: 1,
    })

    const data = { ...userSurvey, submissions }
    const userId = getDbUlid()

    try {
      await SurveyService.saveUserSurvey(userId, data)
    } catch (err) {
      expect(err).toBeInstanceOf(InputError)
    }

    expect(mockedSurveyRepo.saveUserSurveyAndSubmissions).toHaveBeenCalledTimes(
      0
    )
  })

  test('Should validate and save a user survey and its submissions', async () => {
    const userSurvey = buildUserSurvey()
    const submissions = [
      buildUserSurveySubmission({ responseChoiceId: 1, questionId: 1 }),
      buildUserSurveySubmission({ responseChoiceId: 5, questionId: 5 }),
      buildUserSurveySubmission({ responseChoiceId: 10, questionId: 10 }),
    ]
    const data = { ...userSurvey, submissions }
    const userId = getDbUlid()

    mockedSurveyRepo.saveUserSurveyAndSubmissions.mockResolvedValueOnce()

    await SurveyService.saveUserSurvey(userId, data)
    const expectedUserSurvey = {
      surveyId: data.surveyId,
      sessionId: data.sessionId,
      surveyTypeId: data.surveyTypeId,
    }
    const expectedSubmissions = data.submissions
    expect(mockedSurveyRepo.saveUserSurveyAndSubmissions).toHaveBeenCalledTimes(
      1
    )
    expect(mockedSurveyRepo.saveUserSurveyAndSubmissions).toHaveBeenCalledWith(
      userId,
      expectedUserSurvey,
      expectedSubmissions
    )
  })

  test(`Should trigger ${FEEDBACK_EVENTS.FEEDBACK_SAVED} after saving postsession survey`, async () => {
    const sessionId = getDbUlid()
    const userSurvey = buildUserSurvey({ sessionId })
    const submissions = [
      buildUserSurveySubmission({ responseChoiceId: 1, questionId: 1 }),
      buildUserSurveySubmission({ responseChoiceId: 5, questionId: 5 }),
      buildUserSurveySubmission({ responseChoiceId: 10, questionId: 10 }),
    ]
    const data = { ...userSurvey, submissions }
    const userId = getDbUlid()

    mockedSurveyRepo.saveUserSurveyAndSubmissions.mockResolvedValueOnce()
    mockedSurveyRepo.getSurveyTypeFromSurveyTypeId.mockResolvedValueOnce(
      'postsession'
    )

    await SurveyService.saveUserSurvey(userId, data)
    const expectedUserSurvey = {
      surveyId: data.surveyId,
      sessionId: data.sessionId,
      surveyTypeId: data.surveyTypeId,
    }
    const expectedSubmissions = data.submissions
    expect(mockedSurveyRepo.saveUserSurveyAndSubmissions).toHaveBeenCalledTimes(
      1
    )
    expect(mockedSurveyRepo.saveUserSurveyAndSubmissions).toHaveBeenCalledWith(
      userId,
      expectedUserSurvey,
      expectedSubmissions
    )
    expect(emitter.emit).toHaveBeenCalledTimes(1)
    expect(emitter.emit).toHaveBeenCalledWith(
      FEEDBACK_EVENTS.FEEDBACK_SAVED,
      userSurvey.sessionId
    )
  })
})

describe('getPostsessionSurveyDefinition', () => {
  test('returns the postsession survey definition', async () => {
    mockedSessionRepo.getSessionById.mockResolvedValue({
      id: 'session-id',
      studentId: 'student-id',
      volunteerId: 'volunteer-id',
      subjectDisplayName: 'Prealgebra',
    } as Session)
    mockedSurveyRepo.getStudentsPresessionGoal.mockResolvedValue('eat cake')
    mockedUserService.getUserContactInfo
      .mockResolvedValueOnce({
        id: 'student-id',
        firstName: 'StudentName',
        roleContext: new RoleContext(['student'], 'student', 'student'),
      } as UserContactInfo & { roleContext: RoleContext })
      .mockResolvedValueOnce({
        id: 'volunteer-id',
        firstName: 'CoachName',
        roleContext: new RoleContext(['volunteer'], 'volunteer', 'volunteer'),
      } as UserContactInfo & { roleContext: RoleContext })

    mockedSurveyRepo.getPostsessionSurveyDefinition.mockResolvedValue([
      {
        surveyId: 10,
        surveyTypeId: 2,
        name: 'Test Survey Name',
        questionId: 1,
        questionText: 'This is the first question %s',
        displayPriority: 10,
        questionType: 'multiple choice',
        firstReplacementColumn: 'student_name',
        secondReplacementColumn: undefined,
        responses: [
          {
            responseId: 1,
            responseText: 'option 1',
          },
          {
            responseId: 2,
            responseText: 'option 2',
          },
        ],
      },
      {
        surveyId: 10,
        surveyTypeId: 2,
        name: 'Test Survey Name',
        questionId: 2,
        questionText: 'This is the second question %s %s',
        displayPriority: 10,
        questionType: 'multiple choice',
        firstReplacementColumn: 'subject_name',
        secondReplacementColumn: 'student_goal',
        responses: [],
      },
      {
        surveyId: 10,
        surveyTypeId: 2,
        name: 'Test Survey Name',
        questionId: 3,
        questionText: 'This is the third question',
        displayPriority: 10,
        questionType: 'multiple choice',
        firstReplacementColumn: undefined,
        secondReplacementColumn: undefined,
        responses: [
          {
            responseId: 1,
            responseText: 'option 1',
          },
        ],
      },
    ])

    const actualSurveyDefinition =
      await SurveyService.getPostsessionSurveyDefinition(
        'session-id',
        'student'
      )

    expect(actualSurveyDefinition).toBeDefined()
    expect(actualSurveyDefinition?.surveyId).toBe(10)
    expect(actualSurveyDefinition?.surveyTypeId).toBe(2)
    expect(actualSurveyDefinition?.survey.length).toBe(3)
    expect(actualSurveyDefinition?.survey).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          questionId: expect.any(Number),
          questionText: expect.any(String),
          displayPriority: expect.any(Number),
          questionType: expect.any(String),
          responses: expect.any(Array),
        }),
      ])
    )
    expect(actualSurveyDefinition?.survey[0].questionText).toBe(
      'This is the first question StudentName'
    )
    expect(actualSurveyDefinition?.survey[1].questionText).toBe(
      'This is the second question Prealgebra eat cake'
    )
    expect(actualSurveyDefinition?.survey[2].questionText).toBe(
      'This is the third question'
    )
  })

  test('skips the student goal question if no presession survey completed', async () => {
    mockedSessionRepo.getSessionById.mockResolvedValue({
      id: 'session-id',
      studentId: 'student-id',
      volunteerId: 'volunteer-id',
      subjectDisplayName: 'Reading',
    } as Session)
    mockedSurveyRepo.getStudentsPresessionGoal.mockResolvedValue(undefined)
    mockedUserService.getUserContactInfo
      .mockResolvedValueOnce({
        id: 'student-id',
        firstName: 'StudentName',
        roleContext: new RoleContext(['student'], 'student', 'student'),
      } as UserContactInfo & { roleContext: RoleContext })
      .mockResolvedValueOnce({
        id: 'volunteer-id',
        firstName: 'CoachName',
        roleContext: new RoleContext(['volunteer'], 'volunteer', 'volunteer'),
      } as UserContactInfo & { roleContext: RoleContext })

    mockedSurveyRepo.getPostsessionSurveyDefinition.mockResolvedValue([
      {
        surveyId: 10,
        surveyTypeId: 2,
        name: 'Test Survey Name',
        questionId: 1,
        questionText: 'This is the student_goal question %s',
        displayPriority: 10,
        questionType: 'multiple choice',
        firstReplacementColumn: 'student_goal',
        secondReplacementColumn: undefined,
        responses: [],
      },
    ])

    const actualSurveyDefinition =
      await SurveyService.getPostsessionSurveyDefinition(
        'session-id',
        'student'
      )

    expect(actualSurveyDefinition?.survey.length).toBe(0)
  })
})

describe('getUserPostsessionGoalRatingsMetrics', () => {
  it('Returns the correct totals and averages', async () => {
    const userId = '123'
    const otherUserId = '456'
    mockedUserRolesService.getRoleContext.mockResolvedValue({
      legacyRole: 'student',
    } as any)
    const surveyResponses: PostsessionSurveyGoalResponse[] = [
      // self-reported
      // user was the student
      buildPostsessionSurveyGoalResponse({
        roleInSession: 'student',
        submitterUserId: userId,
        score: 3,
      }),
      buildPostsessionSurveyGoalResponse({
        roleInSession: 'student',
        submitterUserId: userId,
        score: 3,
      }),
      // user was the volunteer
      buildPostsessionSurveyGoalResponse({
        roleInSession: 'volunteer',
        submitterUserId: userId,
        score: 4,
      }),

      // partner submissions
      // partner was the volunteer
      buildPostsessionSurveyGoalResponse({
        roleInSession: 'volunteer',
        submitterUserId: otherUserId,
        score: 5,
      }),
    ]
    mockedSurveyRepo.getUserPostsessionSurveyResponses.mockResolvedValue(
      surveyResponses
    )

    const result =
      await SurveyService.getUserPostsessionGoalRatingsMetrics(userId)
    expect(result).toEqual({
      selfReportedStudentRating: {
        total: 2,
        average: 3,
      },
      selfReportedVolunteerRating: {
        total: 1,
        average: 4,
      },
      partnerReportedStudentRating: {
        total: 1,
        average: 5,
      },
      partnerReportedVolunteerRating: {
        total: 0,
        average: 0,
      },
      // Legacy values
      selfReportedRating: {
        total: 2,
        average: 3,
      },
      partnerReportedRating: {
        total: 1,
        average: 5,
      },
    })
  })
})
