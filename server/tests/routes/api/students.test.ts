import { mocked } from 'jest-mock'
import request, { Response } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { routeStudents } from '../../../router/api/students'
import * as StudentRepo from '../../../models/Student/queries'
import * as AssignmentsService from '../../../services/AssignmentsService'
import * as StudentService from '../../../services/StudentService'
import config from '../../../config'
import { getUuid } from '../../../models/pgUtils'
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
jest.mock('../../../utils/auth-utils', () => {
  const actual = jest.requireActual('../../../utils/auth-utils')
  return {
    ...actual,
    authPassport: {
      ...actual.authPassport,
      isAdmin(_req: unknown, _res: unknown, next: () => void): void {
        next()
      },
    },
  }
})
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

function sendGet(path: string): Promise<Response> {
  return agent.get(path).set('Accept', 'application/json')
}

function sendGetQuery(
  path: string,
  payload?: Record<string, unknown>
): Promise<Response> {
  return agent
    .get(path)
    .set('Accept', 'application/json')
    .query(payload ?? {})
}

function sendPost(
  path: string,
  payload?: Record<string, unknown>
): Promise<Response> {
  return agent.post(path).set('Accept', 'application/json').send(payload)
}

describe('routeStudents', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildStudent()
  })

  describe('GET /api/students/remaining-favorite-volunteers', () => {
    test('Students should see remaining number of volunteers they can favorite', async () => {
      const totalFavorited = 5
      mockedStudentRepo.getTotalFavoriteVolunteers.mockResolvedValueOnce(
        totalFavorited
      )

      const response = await sendGet(
        '/api/students/remaining-favorite-volunteers'
      )
      expect(response.body).toEqual({
        remaining: config.favoriteVolunteerLimit - totalFavorited,
      })
      expect(response.status).toBe(200)
    })
  })

  describe('GET /api/students/favorite-volunteers', () => {
    test('Students should get a list of favorited volunteers', async () => {
      const payload = {
        page: 2,
      }
      const expected = {
        favoriteVolunteers: [
          {
            volunteerId: getUuid(),
            firstName: 'Test 1',
            numSessions: 3,
          },
          {
            volunteerId: getUuid(),
            firstName: 'Test 2',
            numSessions: 0,
          },
        ],
        isLastPage: true,
      }
      mockedStudentService.getFavoriteVolunteersPaginated.mockResolvedValueOnce(
        expected
      )

      const response = await sendGetQuery(
        '/api/students/favorite-volunteers',
        payload
      )
      expect(response.body).toEqual({
        favoriteVolunteers: expected.favoriteVolunteers,
        isLastPage: expected.isLastPage,
      })
      expect(response.status).toBe(200)
    })

    test('Route should throw when page is not a number', async () => {
      const payload = {
        page: 'test',
      }
      const response = await sendGetQuery(
        '/api/students/favorite-volunteers',
        payload
      )
      expect(response.status).toBe(422)
    })
  })

  describe('GET /api/students/favorite-volunteers/:volunteerId', () => {
    test('Students should see volunteer is favorited', async () => {
      const volunteerId = getUuid()
      const expectedIsFavorite = false
      mockedStudentRepo.isFavoriteVolunteer.mockResolvedValueOnce(
        expectedIsFavorite
      )

      const response = await sendGet(
        `/api/students/favorite-volunteers/${volunteerId}`
      )
      expect(response.body).toEqual({ isFavorite: expectedIsFavorite })
      expect(response.status).toBe(200)
    })
  })

  describe('POST /api/students/favorite-volunteers/:volunteerId', () => {
    test('Students should be able to favorite volunteer', async () => {
      const volunteerId = getUuid()
      const expectedIsFavorite = true
      const payload = { isFavorite: expectedIsFavorite }
      mockedStudentService.checkAndUpdateVolunteerFavoriting.mockResolvedValueOnce(
        { isFavorite: true }
      )

      const response = await sendPost(
        `/api/students/favorite-volunteers/${volunteerId}`,
        payload
      )
      expect(response.body).toEqual({ isFavorite: expectedIsFavorite })
      expect(response.status).toBe(200)
    })

    test('Students should be able to favorite volunteer with sessionId in the payload', async () => {
      const volunteerId = getUuid()
      const expectedIsFavorite = true
      const payload = { isFavorite: expectedIsFavorite, sessionId: getUuid() }
      mockedStudentService.checkAndUpdateVolunteerFavoriting.mockResolvedValueOnce(
        { isFavorite: true }
      )

      const response = await sendPost(
        `/api/students/favorite-volunteers/${volunteerId}`,
        payload
      )
      expect(response.body).toEqual({ isFavorite: expectedIsFavorite })
      expect(response.status).toBe(200)
    })

    test('Students should be able to unfavorite volunteer', async () => {
      const volunteerId = getUuid()
      const expectedIsFavorite = false
      const payload = { isFavorite: expectedIsFavorite }
      mockedStudentService.checkAndUpdateVolunteerFavoriting.mockResolvedValueOnce(
        { isFavorite: false }
      )

      const response = await sendPost(
        `/api/students/favorite-volunteers/${volunteerId}`,
        payload
      )
      expect(response.body).toEqual({ isFavorite: expectedIsFavorite })
      expect(response.status).toBe(200)
    })

    test('Students should be not be able to favorite more than max volunteers', async () => {
      const volunteerId = getUuid()
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
        `/api/students/favorite-volunteers/${volunteerId}`,
        payload
      )
      expect(response.status).toBe(422)
      expect(response.body).toEqual({
        success: false,
        message: 'Favorite volunteer limit reached.',
      })
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
        undefined
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
