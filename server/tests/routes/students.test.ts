import { mocked } from 'ts-jest/utils'
import request, { Test } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../mock-app'
import { buildStudent } from '../generate'
import { routeStudents } from '../../router/api/students'
import * as StudentRepo from '../../models/Student/queries'
import * as StudentService from '../../services/StudentService'
import config from '../../config'
import { getDbUlid } from '../../models/pgUtils'

jest.mock('../../models/Student/queries')
jest.mock('../../services/StudentService')
const mockedStudentRepo = mocked(StudentRepo, true)
const mockedStudentService = mocked(StudentService, true)

// mock app - passport should attach any user we need
const app = mockApp()
const mockGetUser = () => buildStudent()
app.use(mockPassportMiddleware(mockGetUser))

// use the students router
const router = mockRouter()
routeStudents(router)
app.use('/api', router)

const agent = request.agent(app)
const API_ROUTE = '/api'

async function sendGetQuery(route: string, payload: any): Promise<Test> {
  return agent
    .get(API_ROUTE + route)
    .set('Accept', 'application/json')
    .query(payload)
    .send()
}

async function sendGet(route: string, payload: any): Promise<Test> {
  return agent
    .get(API_ROUTE + route)
    .set('Accept', 'application/json')
    .send(payload)
}

const REMAINING_FAVORITE_ROUTE = '/students/remaining-favorite-volunteers'
describe(REMAINING_FAVORITE_ROUTE, () => {
  test('Students should see remaining number of volunteers they can favorite', async () => {
    const totalFavorited = 5
    mockedStudentRepo.getTotalFavoriteVolunteers.mockResolvedValueOnce(
      totalFavorited
    )
    const response = await sendGet(REMAINING_FAVORITE_ROUTE, {})
    const {
      body: { remaining },
    } = response
    expect(remaining).toEqual(config.favoriteVolunteerLimit - totalFavorited)
    expect(response.status).toBe(200)
  })
})

function IS_FAVORITE_VOLUNTEER_PATH(volunteerId: string) {
  return `/students/favorite-volunteers/${volunteerId}`
}
describe(IS_FAVORITE_VOLUNTEER_PATH(':volunteerId'), () => {
  test('Students should see volunteer is favorited', async () => {
    const volunteerId = getDbUlid()
    const expectedIsFavorite = false
    mockedStudentRepo.isFavoriteVolunteer.mockResolvedValueOnce(
      expectedIsFavorite
    )
    const response = await sendGet(IS_FAVORITE_VOLUNTEER_PATH(volunteerId), {})
    const {
      body: { isFavorite },
    } = response
    expect(isFavorite).toEqual(expectedIsFavorite)
    expect(response.status).toBe(200)
  })
})

const FAVORITE_VOLUNTEERS_PATH = '/students/favorite-volunteers'
describe(FAVORITE_VOLUNTEERS_PATH, () => {
  test('Students should get a list of favorited volunteers', async () => {
    const payload = {
      page: 2,
    }
    const expected = {
      favoriteVolunteers: [
        {
          volunteerId: getDbUlid(),
          firstName: 'Test 1',
          numSessions: 3,
        },
        {
          volunteerId: getDbUlid(),
          firstName: 'Test 2',
          numSessions: 0,
        },
      ],
      isLastPage: true,
    }
    mockedStudentService.getFavoriteVolunteersPaginated.mockResolvedValueOnce(
      expected
    )
    const response = await sendGetQuery(FAVORITE_VOLUNTEERS_PATH, payload)
    const {
      body: { favoriteVolunteers, isLastPage },
    } = response
    expect(favoriteVolunteers).toEqual(expected.favoriteVolunteers)
    expect(isLastPage).toEqual(expected.isLastPage)
    expect(response.status).toBe(200)
  })

  test('Route should throw when page is not a number', async () => {
    const payload = {
      page: 'test',
    }
    const response = await sendGetQuery(FAVORITE_VOLUNTEERS_PATH, payload)
    expect(response.status).toBe(422)
  })
})
