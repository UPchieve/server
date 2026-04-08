import { mocked } from 'jest-mock'
import request, { Response } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { routeTraining } from '../../../router/api/training'
import * as TrainingCtrl from '../../../controllers/TrainingCtrl'
import * as TrainingCourseService from '../../../services/TrainingCourseService'
import * as VolunteerService from '../../../services/VolunteerService'
import * as UserActionQueries from '../../../models/UserAction/queries'
import * as QuestionQueries from '../../../models/Question/queries'
import { QUIZ_USER_ACTIONS } from '../../../constants'
import {
  buildQuizScoreResult,
  buildTrainingCourse,
  buildTrainingCourseProgress,
  buildTrainingQuestion,
  buildVolunteer,
} from '../../mocks/generate'

jest.mock('../../../controllers/TrainingCtrl')
jest.mock('../../../services/TrainingCourseService')
jest.mock('../../../services/VolunteerService')
jest.mock('../../../models/UserAction/queries')
jest.mock('../../../models/Question/queries')

const mockedTrainingCtrl = mocked(TrainingCtrl)
const mockedTrainingCourseService = mocked(TrainingCourseService)
const mockedVolunteerService = mocked(VolunteerService)
const mockedUserActionQueries = mocked(UserActionQueries)
const mockedQuestionQueries = mocked(QuestionQueries)

let mockUser = buildVolunteer()

function mockGetUser() {
  return mockUser
}

const router = mockRouter()
routeTraining(router)

const app = mockApp()
app.use(mockPassportMiddleware(mockGetUser))
app.use('/api', router)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

function sendPost(path: string, payload?: object): Promise<Response> {
  return agent.post(path).set('Accept', 'application/json').send(payload)
}

describe('routeTraining', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildVolunteer()
  })

  const category = 'algebraOne'

  describe('POST /api/training/questions', () => {
    test('returns training questions', async () => {
      const questions = [buildTrainingQuestion({ category })]
      mockedTrainingCtrl.getQuestions.mockResolvedValueOnce(questions)

      const response = await sendPost('/api/training/questions', {
        category,
      })
      expect(response.status).toBe(200)
      expect(mockedTrainingCtrl.getQuestions).toHaveBeenCalledWith(category)
      expect(response.body).toEqual({
        msg: 'Questions retrieved from database',
        questions: questions.map((question) => {
          return {
            ...question,
            createdAt: question.createdAt.toISOString(),
            updatedAt: question.updatedAt.toISOString(),
          }
        }),
      })
    })
  })

  describe('POST /api/training/score', () => {
    test('records passed quiz score', async () => {
      const result = buildQuizScoreResult({ passed: true })
      const idAnswerMap = { '1': 'a' }
      mockedTrainingCtrl.getQuizScore.mockResolvedValueOnce(result)

      const response = await sendPost('/api/training/score', {
        category,
        idAnswerMap,
      })
      expect(response.status).toBe(200)
      expect(mockedTrainingCtrl.getQuizScore).toHaveBeenCalledWith({
        user: mockUser,
        ip: expect.any(String),
        category,
        idAnswerMap,
      })
      expect(mockedUserActionQueries.createQuizAction).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          action: QUIZ_USER_ACTIONS.PASSED,
          quizSubcategory: category,
          ipAddress: expect.any(String),
        },
        expect.anything()
      )
      expect(mockedUserActionQueries.userHasTakenQuiz).not.toHaveBeenCalled()
      expect(
        mockedVolunteerService.queueFailedFirstAttemptedQuizEmail
      ).not.toHaveBeenCalled()
      expect(response.body).toEqual({
        msg: 'Score calculated and saved',
        tries: result.tries,
        passed: result.passed,
        score: result.score,
        idCorrectAnswerMap: result.idCorrectAnswerMap,
        isTrainingSubject: result.isTrainingSubject,
      })
    })

    test('records failed quiz score and queues first failed attempt email', async () => {
      const result = buildQuizScoreResult({ passed: false })
      const idAnswerMap = { '1': 'a' }
      mockedTrainingCtrl.getQuizScore.mockResolvedValueOnce(result)
      mockedUserActionQueries.userHasTakenQuiz.mockResolvedValueOnce(false)

      const response = await sendPost('/api/training/score', {
        category,
        idAnswerMap,
      })
      expect(response.status).toBe(200)
      expect(mockedUserActionQueries.userHasTakenQuiz).toHaveBeenCalledWith(
        mockUser.id
      )
      expect(
        mockedVolunteerService.queueFailedFirstAttemptedQuizEmail
      ).toHaveBeenCalledWith(
        category,
        mockUser.email,
        mockUser.firstName,
        mockUser.id
      )
      expect(mockedUserActionQueries.createQuizAction).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          action: QUIZ_USER_ACTIONS.FAILED,
          quizSubcategory: category,
          ipAddress: expect.any(String),
        },
        expect.anything()
      )
      expect(response.body).toEqual({
        msg: 'Score calculated and saved',
        tries: result.tries,
        passed: result.passed,
        score: result.score,
        idCorrectAnswerMap: result.idCorrectAnswerMap,
        isTrainingSubject: result.isTrainingSubject,
      })
    })

    test('records failed quiz score without queueing email when user has taken quiz before', async () => {
      const result = buildQuizScoreResult({ passed: false })
      mockedTrainingCtrl.getQuizScore.mockResolvedValueOnce(result)
      mockedUserActionQueries.userHasTakenQuiz.mockResolvedValueOnce(true)

      const response = await sendPost('/api/training/score', {
        category,
        idAnswerMap: { '1': 'a' },
      })
      expect(response.status).toBe(200)
      expect(mockedUserActionQueries.userHasTakenQuiz).toHaveBeenCalledWith(
        mockUser.id
      )
      expect(
        mockedVolunteerService.queueFailedFirstAttemptedQuizEmail
      ).not.toHaveBeenCalled()
      expect(mockedUserActionQueries.createQuizAction).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          action: QUIZ_USER_ACTIONS.FAILED,
          quizSubcategory: category,
          ipAddress: expect.any(String),
        },
        expect.anything()
      )
      expect(response.body).toEqual({
        msg: 'Score calculated and saved',
        tries: result.tries,
        passed: result.passed,
        score: result.score,
        idCorrectAnswerMap: result.idCorrectAnswerMap,
        isTrainingSubject: result.isTrainingSubject,
      })
    })
  })

  describe('GET /api/training/review/:category', () => {
    test('returns review materials and creates viewed materials action', async () => {
      const resultList = [
        { title: 'Review material 1', category, pdf: '', image: '' },
        { title: 'Review material 2', category, pdf: '', image: '' },
      ]
      mockedQuestionQueries.getQuizReviewMaterials.mockResolvedValueOnce(
        resultList
      )

      const response = await sendGet(`/api/training/review/${category}`)
      expect(response.status).toBe(200)
      expect(mockedUserActionQueries.createQuizAction).toHaveBeenCalledWith(
        {
          userId: mockUser.id,
          action: QUIZ_USER_ACTIONS.VIEWED_MATERIALS,
          quizSubcategory: category,
          ipAddress: expect.any(String),
        },
        expect.anything()
      )
      expect(mockedQuestionQueries.getQuizReviewMaterials).toHaveBeenCalledWith(
        category
      )
      expect(response.body).toEqual(resultList)
    })
  })

  describe('GET /api/training/course/:courseKey', () => {
    test('returns training course', async () => {
      const course = buildTrainingCourse()
      mockedTrainingCourseService.getCourse.mockResolvedValueOnce(course)

      const response = await sendGet('/api/training/course/upchieve101')
      expect(response.status).toBe(200)
      expect(mockedTrainingCourseService.getCourse).toHaveBeenCalledWith(
        mockUser,
        'upchieve101'
      )
      expect(response.body).toEqual({ course })
    })

    test('returns 404 when course is not found', async () => {
      // TODO: Update the underlying type
      mockedTrainingCourseService.getCourse.mockResolvedValueOnce(undefined)

      const response = await sendGet('/api/training/course/upchieve101')
      expect(response.status).toBe(404)
      expect(mockedTrainingCourseService.getCourse).toHaveBeenCalledWith(
        mockUser,
        'upchieve101'
      )
    })
  })

  describe('POST /api/training/course/:courseKey/progress', () => {
    test('records training course progress', async () => {
      const trainingCourse = buildTrainingCourseProgress()
      const courseKey = 'upchieve101'
      const materialKey = '31rgp3'
      mockedTrainingCourseService.recordProgress.mockResolvedValueOnce(
        trainingCourse
      )

      const response = await sendPost(
        `/api/training/course/${courseKey}/progress`,
        {
          materialKey,
        }
      )
      expect(response.status).toBe(200)
      expect(mockedTrainingCourseService.recordProgress).toHaveBeenCalledWith(
        mockUser,
        courseKey,
        materialKey
      )
      expect(response.body).toEqual(trainingCourse)
    })
  })
})
