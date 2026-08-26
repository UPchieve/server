import { mocked } from 'jest-mock'
import request, { Test } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { routeAssignments } from '../../../router/api/assignments'
import { toAssigmentPublic } from '../../../public/assignments'
import * as AssignmentsService from '../../../services/AssignmentsService'
import {
  buildAssignment,
  buildStudentAssignmentCompletionRow,
  buildStudentAssignmentSubmissionPublic,
  buildUser,
} from '../../mocks/generate'
import type { BlobDocument } from '../../../services/AzureService'

jest.mock('../../../services/AssignmentsService')

const mockedAssignmentsService = mocked(AssignmentsService)

const router = mockRouter()
routeAssignments(router)

const app = mockApp()
const mockUser = buildUser()
function mockGetUser() {
  return mockUser
}
app.use(mockPassportMiddleware(mockGetUser))
app.use('/api', router)

const agent = request.agent(app)
const ASSIGNMENT_ID = 'assignment-123'

async function sendGet(path: string): Promise<Test> {
  return agent.get(path).set('Accept', 'application/json')
}

async function sendDelete(path: string): Promise<Test> {
  return agent.delete(path).set('Accept', 'application/json')
}

describe('routeAssignments', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /api/assignment/:assignmentId', () => {
    test('returns assignment', async () => {
      const isGettingStartedAssignment = true
      const assignment = buildAssignment({ isGettingStartedAssignment })
      mockedAssignmentsService.getAssignmentById.mockResolvedValueOnce(
        assignment
      )
      mockedAssignmentsService.isGettingStartedAssignment.mockResolvedValueOnce(
        isGettingStartedAssignment
      )

      const response = await sendGet(`/api/assignment/${assignment.id}`)
      expect(response.status).toBe(200)
      expect(mockedAssignmentsService.getAssignmentById).toHaveBeenCalledWith(
        assignment.id
      )
      expect(
        mockedAssignmentsService.isGettingStartedAssignment
      ).toHaveBeenCalledWith(assignment.id)
      expect(response.body).toEqual({
        assignment: {
          ...assignment,
          startDate: assignment.startDate?.toISOString(),
          dueDate: assignment.dueDate?.toISOString(),
          createdAt: assignment.createdAt.toISOString(),
          updatedAt: undefined,
        },
      })
    })

    test('returns undefined when no assignment exists', async () => {
      mockedAssignmentsService.getAssignmentById.mockResolvedValueOnce(
        undefined
      )

      const response = await sendGet(`/api/assignment/${ASSIGNMENT_ID}`)
      expect(response.status).toBe(200)
      expect(mockedAssignmentsService.getAssignmentById).toHaveBeenCalledWith(
        ASSIGNMENT_ID
      )
      expect(
        mockedAssignmentsService.isGettingStartedAssignment
      ).not.toHaveBeenCalled()
      expect(response.body).toEqual({
        assignment: undefined,
      })
    })
  })

  describe('GET /api/assignment/:assignmentId/students', () => {
    test('returns student assignment completion details', async () => {
      const studentAssignments = [
        buildStudentAssignmentCompletionRow(),
        buildStudentAssignmentCompletionRow(),
      ]
      const publicAssignments = studentAssignments.map(
        buildStudentAssignmentSubmissionPublic
      )
      mockedAssignmentsService.getStudentAssignmentCompletion.mockResolvedValueOnce(
        studentAssignments
      )

      const response = await sendGet(
        `/api/assignment/${ASSIGNMENT_ID}/students`
      )
      expect(response.status).toBe(200)
      expect(
        mockedAssignmentsService.getStudentAssignmentCompletion
      ).toHaveBeenCalledWith(ASSIGNMENT_ID)

      expect(response.body).toEqual({
        studentAssignments: publicAssignments,
      })
    })
  })

  describe('DELETE /api/assignment/:assignmentId', () => {
    test('deletes the assignment and returns 200', async () => {
      mockedAssignmentsService.deleteAssignment.mockResolvedValueOnce()

      const response = await sendDelete(`/api/assignment/${ASSIGNMENT_ID}`)
      expect(response.status).toBe(200)
      expect(mockedAssignmentsService.deleteAssignment).toHaveBeenCalledWith(
        ASSIGNMENT_ID
      )
    })
  })

  describe('GET /api/assignment/:assignmentId/documents', () => {
    test('returns assignment documents', async () => {
      const assignmentDocuments: BlobDocument[] = [
        {
          name: 'worksheet.pdf',
          url: 'https://example.com/worksheet.pdf',
        },
      ]

      mockedAssignmentsService.getAssignmentDocuments.mockResolvedValueOnce(
        assignmentDocuments
      )

      const response = await sendGet(
        `/api/assignment/${ASSIGNMENT_ID}/documents`
      )
      expect(
        mockedAssignmentsService.getAssignmentDocuments
      ).toHaveBeenCalledWith(ASSIGNMENT_ID)
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        assignmentDocuments,
      })
    })
  })
})

describe('toAssigmentPublic', () => {
  test('maps all fields and converts dates to ISO strings', () => {
    const assignment = buildAssignment()

    const result = toAssigmentPublic(assignment)

    expect(result).toEqual({
      id: assignment.id,
      classId: assignment.classId,
      description: assignment.description,
      dueDate: assignment.dueDate?.toISOString(),
      isRequired: assignment.isRequired,
      minDurationInMinutes: assignment.minDurationInMinutes,
      numberOfSessions: assignment.numberOfSessions,
      startDate: assignment.startDate?.toISOString(),
      subjectId: assignment.subjectId,
      title: assignment.title,
      isGettingStartedAssignment: assignment.isGettingStartedAssignment,
      createdAt: assignment.createdAt.toISOString(),
      subjectName: assignment.subjectName,
    })
  })

  test('drops updatedAt', () => {
    const assignment = buildAssignment({ updatedAt: new Date() })

    const result = toAssigmentPublic(assignment)

    expect(result).not.toHaveProperty('updatedAt')
  })

  test('omits dueDate and startDate when not present on the assignment', () => {
    const assignment = buildAssignment({
      dueDate: undefined,
      startDate: undefined,
    })

    const result = toAssigmentPublic(assignment)

    expect(result.dueDate).toBeUndefined()
    expect(result.startDate).toBeUndefined()
  })

  test('passes through other optional fields as undefined when not present', () => {
    const assignment = buildAssignment({
      description: undefined,
      minDurationInMinutes: undefined,
      numberOfSessions: undefined,
      subjectId: undefined,
      title: undefined,
      isGettingStartedAssignment: undefined,
      subjectName: undefined,
    })

    const result = toAssigmentPublic(assignment)

    expect(result.description).toBeUndefined()
    expect(result.minDurationInMinutes).toBeUndefined()
    expect(result.numberOfSessions).toBeUndefined()
    expect(result.subjectId).toBeUndefined()
    expect(result.title).toBeUndefined()
    expect(result.isGettingStartedAssignment).toBeUndefined()
    expect(result.subjectName).toBeUndefined()
  })

  test('preserves isRequired as false without coercion', () => {
    const assignment = buildAssignment({ isRequired: false })

    const result = toAssigmentPublic(assignment)

    expect(result.isRequired).toBe(false)
  })
})
