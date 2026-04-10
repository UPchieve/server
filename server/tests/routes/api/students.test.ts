import { mocked } from 'jest-mock'
import request, { Test } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { routeStudents } from '../../../router/api/students'
import * as StudentRepo from '../../../models/Student/queries'
import * as AssignmentsService from '../../../services/AssignmentsService'
import * as StudentService from '../../../services/StudentService'
import config from '../../../config'
import { getDbUlid, getUuid } from '../../../models/pgUtils'
import { FavoriteLimitReachedError } from '../../../services/Errors'
import {
  buildStudent,
  buildStudentAssignment,
  buildTeacherClassResult,
  buildUser,
} from '../../mocks/generate'

jest.mock('../../../models/Student/queries')
jest.mock('../../../services/StudentService')
jest.mock('../../../services/AssignmentsService')
const mockedStudentRepo = mocked(StudentRepo)
const mockedAssignmentsService = mocked(AssignmentsService)
const mockedStudentService = mocked(StudentService)

const app = mockApp()

let mockUser = buildUser()

function mockGetUser() {
  return mockUser
}

app.use(mockPassportMiddleware(mockGetUser))

// use the students router
const router = mockRouter()
routeStudents(router)
app.use('/api', router)

const agent = request.agent(app)
const API_ROUTE = '/api'

async function sendGetQuery(
  route: string,
  payload: Record<string, unknown>
): Promise<Test> {
  return agent
    .get(API_ROUTE + route)
    .set('Accept', 'application/json')
    .query(payload)
    .send()
}

async function sendGet(
  route: string,
  payload?: Record<string, unknown>
): Promise<Test> {
  if (payload)
    return agent
      .get(API_ROUTE + route)
      .set('Accept', 'application/json')
      .send(payload)

  return agent.get(route).set('Accept', 'application/json')
}

async function sendPost(
  route: string,
  payload?: Record<string, unknown>
): Promise<Test> {
  return agent
    .post(API_ROUTE + route)
    .set('Accept', 'application/json')
    .send(payload)
}

describe('routeStudents', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildStudent()
  })

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
      const response = await sendGet(
        IS_FAVORITE_VOLUNTEER_PATH(volunteerId),
        {}
      )
      const {
        body: { isFavorite },
      } = response
      expect(isFavorite).toEqual(expectedIsFavorite)
      expect(response.status).toBe(200)
    })

    test('Students should be able to favorite volunteer', async () => {
      const volunteerId = getDbUlid()
      const expectedIsFavorite = true
      const payload = { isFavorite: expectedIsFavorite }
      mockedStudentService.checkAndUpdateVolunteerFavoriting.mockResolvedValueOnce(
        { isFavorite: true }
      )
      const response = await sendPost(
        IS_FAVORITE_VOLUNTEER_PATH(volunteerId.toString()),
        payload
      )
      const {
        body: { isFavorite },
      } = response

      expect(isFavorite).toEqual(expectedIsFavorite)
      expect(response.status).toBe(200)
    })

    test('Students should be able to favorite volunteer with sessionId in the payload', async () => {
      const volunteerId = getDbUlid()
      const expectedIsFavorite = true
      const payload = { isFavorite: expectedIsFavorite, sessionId: getDbUlid() }
      mockedStudentService.checkAndUpdateVolunteerFavoriting.mockResolvedValueOnce(
        { isFavorite: true }
      )
      const response = await sendPost(
        IS_FAVORITE_VOLUNTEER_PATH(volunteerId.toString()),
        payload
      )
      const {
        body: { isFavorite },
      } = response

      expect(isFavorite).toEqual(expectedIsFavorite)
      expect(response.status).toBe(200)
    })

    test('Students should be able to unfavorite volunteer', async () => {
      const volunteerId = getDbUlid()
      const expectedIsFavorite = false
      const payload = { isFavorite: expectedIsFavorite }
      mockedStudentService.checkAndUpdateVolunteerFavoriting.mockResolvedValueOnce(
        { isFavorite: false }
      )
      const response = await sendPost(
        IS_FAVORITE_VOLUNTEER_PATH(volunteerId.toString()),
        payload
      )
      const {
        body: { isFavorite },
      } = response

      expect(isFavorite).toEqual(expectedIsFavorite)
      expect(response.status).toBe(200)
    })

    test('Students should be not be able to favorite more than max volunteers', async () => {
      const volunteerId = getDbUlid()
      const expectedIsFavorite = true
      const payload = { isFavorite: expectedIsFavorite }
      mockedStudentService.checkAndUpdateVolunteerFavoriting.mockImplementationOnce(
        async () => {
          throw new FavoriteLimitReachedError(
            'Favorite volunteer limit reached.'
          )
        }
      )
      const response = await sendPost(
        IS_FAVORITE_VOLUNTEER_PATH(volunteerId.toString()),
        payload
      )

      expect(response.status).toBe(422)
      expect(response.body.message).toBe('Favorite volunteer limit reached.')
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

  describe('GET /api/students/partners/active', () => {
    test('returns active partners for student', async () => {
      mockUser = buildUser({ isAdmin: true })
      const studentId = getUuid()
      const activePartners = [
        { id: getUuid(), name: 'Partner 1' },
        { id: getUuid(), name: 'Partner 2' },
      ]
      mockedStudentService.adminGetActivePartnersForStudent.mockResolvedValueOnce(
        activePartners
      )

      const response = await sendGet(
        `/api/students/partners/active?student=${studentId}`
      )
      expect(response.status).toBe(200)
      expect(
        mockedStudentService.adminGetActivePartnersForStudent
      ).toHaveBeenCalledWith(studentId)
      expect(response.body).toEqual({ activePartners })
    })

    test('returns empty list when service returns undefined', async () => {
      mockUser = buildUser({ isAdmin: true })
      const studentId = getUuid()
      mockedStudentService.adminGetActivePartnersForStudent.mockResolvedValueOnce(
        undefined as never
      )

      const response = await sendGet(
        `/api/students/partners/active?student=${studentId}`
      )

      expect(response.status).toBe(200)
      expect(response.body).toEqual({ activePartners: [] })
    })
  })

  describe('GET /api/students/classes', () => {
    test('returns active classes for student', async () => {
      const classes = [buildTeacherClassResult(), buildTeacherClassResult()]
      mockedStudentService.getActiveClassesForStudent.mockResolvedValueOnce(
        classes
      )

      const response = await sendGet('/api/students/classes')
      expect(response.status).toBe(200)
      expect(
        mockedStudentService.getActiveClassesForStudent
      ).toHaveBeenCalledWith(mockUser.id)
      expect(response.body).toEqual({
        classes: classes.map((teacherClass) => ({
          ...teacherClass,
          createdAt: teacherClass.createdAt.toISOString(),
          updatedAt: teacherClass.updatedAt.toISOString(),
        })),
      })
    })
  })

  describe('GET /api/students/assignments', () => {
    test('returns assignments for student', async () => {
      const assignments = [buildStudentAssignment(), buildStudentAssignment()]
      mockedAssignmentsService.getAssignmentsByStudentId.mockResolvedValueOnce(
        assignments
      )

      const response = await sendGet('/api/students/assignments')
      expect(response.status).toBe(200)
      expect(
        mockedAssignmentsService.getAssignmentsByStudentId
      ).toHaveBeenCalledWith(mockUser.id)
      expect(response.body).toEqual({
        assignments: assignments.map((assignment) => ({
          ...assignment,
          assignedAt: assignment.assignedAt.toISOString(),
          dueDate: assignment.dueDate?.toISOString(),
          startDate: assignment.startDate?.toISOString(),
          submittedAt: assignment.submittedAt?.toISOString(),
        })),
      })
    })
  })
})
