import request, { Response } from 'supertest'
import { mocked } from 'jest-mock'
import { mockApp } from '../../mock-app'
import * as SubjectsRouter from '../../../router/subjects'
import * as SubjectsModel from '../../../models/Subjects'

jest.mock('../../../models/Subjects')
jest.mock('../../../logger')

const mockedSubjectsModel = mocked(SubjectsModel)

const app = mockApp()
SubjectsRouter.routes(app)

const agent = request.agent(app)

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

describe('routeSubjects', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api-public/subjects', () => {
    test('returns subjects with topic', async () => {
      const subjects = {
        algebraOne: {
          id: 1,
          name: 'algebraOne',
          displayOrder: 1,
          displayName: 'Algebra 1',
          active: true,
          topicId: 10,
          topicName: 'math',
          topicDisplayName: 'Math',
          topicDashboardOrder: 1,
          isComputedUnlock: false,
          topicIconLink: '/math.svg',
          topicColor: '#123456',
        },
        biology: {
          id: 2,
          name: 'biology',
          displayOrder: 2,
          displayName: 'Biology',
          active: true,
          topicId: 20,
          topicName: 'science',
          topicDisplayName: 'Science',
          topicDashboardOrder: 2,
          isComputedUnlock: false,
          topicIconLink: '/science.svg',
          topicColor: '#654321',
        },
      }
      mockedSubjectsModel.getSubjectsWithTopic.mockResolvedValueOnce(subjects)

      const response = await sendGet('/api-public/subjects')
      expect(response.status).toBe(200)
      expect(mockedSubjectsModel.getSubjectsWithTopic).toHaveBeenCalledTimes(1)
      expect(response.body).toEqual({
        subjects,
      })
    })

    test('returns empty subjects object', async () => {
      mockedSubjectsModel.getSubjectsWithTopic.mockResolvedValueOnce({})

      const response = await sendGet('/api-public/subjects')
      expect(response.status).toBe(200)
      expect(mockedSubjectsModel.getSubjectsWithTopic).toHaveBeenCalledTimes(1)
      expect(response.body).toEqual({
        subjects: {},
      })
    })
  })
})
