import { mocked } from 'jest-mock'
import request, { Response } from 'supertest'
import { mockApp, mockRouter } from '../../mock-app'
import { routeSubjects } from '../../../router/api/subjects'
import * as SubjectsService from '../../../services/SubjectsService'
import * as SubjectsRepo from '../../../models/Subjects'
import {
  buildGetTopicsResult,
  buildSubjectWithTopic,
  buildTrainingView,
} from '../../mocks/generate'

jest.mock('../../../services/SubjectsService')
jest.mock('../../../models/Subjects')

const mockedSubjectsService = mocked(SubjectsService)
const mockedSubjectsRepo = mocked(SubjectsRepo)

const router = mockRouter()
routeSubjects(router)

const app = mockApp()
app.use('/api', router)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

describe('routeSubjects', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /api/subjects', () => {
    test('returns subjects with topics', async () => {
      const subjectOne = buildSubjectWithTopic({ name: 'algebraOne' })
      const subjectTwo = buildSubjectWithTopic({ name: 'biology' })
      const subjects = {
        [subjectOne.name]: subjectOne,
        [subjectTwo.name]: subjectTwo,
      }
      mockedSubjectsRepo.getSubjectsWithTopic.mockResolvedValueOnce(subjects)

      const response = await sendGet('/api/subjects')
      expect(response.status).toBe(200)
      expect(mockedSubjectsRepo.getSubjectsWithTopic).toHaveBeenCalled()
      expect(response.body).toEqual({
        subjects,
      })
    })
  })

  describe('GET /api/subjects/training', () => {
    test('returns volunteer training data', async () => {
      const training = buildTrainingView()
      mockedSubjectsRepo.getVolunteerTrainingData.mockResolvedValueOnce(
        training
      )

      const response = await sendGet('/api/subjects/training')
      expect(response.status).toBe(200)
      expect(mockedSubjectsRepo.getVolunteerTrainingData).toHaveBeenCalled()
      expect(response.body).toEqual({
        training,
      })
    })
  })

  describe('GET /api/subjects/is-valid', () => {
    test('returns whether subject/topic pair is valid', async () => {
      const topic = 'math'
      const subject = 'algebraOne'
      mockedSubjectsService.isValidSubjectAndTopic.mockResolvedValueOnce(true)

      const response = await sendGet(
        `/api/subjects/is-valid?subject=${subject}&topic=${topic}`
      )
      expect(response.status).toBe(200)
      expect(mockedSubjectsService.isValidSubjectAndTopic).toHaveBeenCalledWith(
        expect.objectContaining({
          subject,
          topic,
        })
      )
      expect(response.body).toEqual({ isValid: true })
    })
  })

  describe('GET /api/topics', () => {
    test('returns topics', async () => {
      const topics = [buildGetTopicsResult(), buildGetTopicsResult()]
      mockedSubjectsService.getTopics.mockResolvedValueOnce(topics as never)

      const response = await sendGet('/api/topics')
      expect(response.status).toBe(200)
      expect(mockedSubjectsService.getTopics).toHaveBeenCalled()
      expect(response.body).toEqual({
        topics,
      })
    })
  })
})
