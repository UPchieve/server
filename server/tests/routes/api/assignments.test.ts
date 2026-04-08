import { mocked } from 'jest-mock'
import request, { Test } from 'supertest'
import { mockApp, mockRouter } from '../../mock-app'
import { routeAssignments } from '../../../router/api/assignments'
import * as AssignmentsService from '../../../services/AssignmentsService'
import { buildAssignment } from '../../mocks/generate'
import type { BlobDocument } from '../../../services/AzureService'

jest.mock('../../../services/AssignmentsService')

const mockedAssignmentsService = mocked(AssignmentsService)

const router = mockRouter()
routeAssignments(router)

const app = mockApp()
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
      const assignment = buildAssignment()

      mockedAssignmentsService.getAssignmentById.mockResolvedValueOnce(
        assignment
      )
      mockedAssignmentsService.isGettingStartedAssignment.mockResolvedValueOnce(
        true
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
          dueDate: assignment.dueDate?.toISOString(),
          startDate: assignment.startDate?.toISOString(),
          createdAt: assignment.createdAt.toISOString(),
          updatedAt: assignment.updatedAt.toISOString(),
          isGettingStartedAssignment: true,
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
    type StudentAssignmentCompletionRow = {
      firstName: string
      lastName: string
      submittedAt: Date | null
    }

    test('returns student assignment completion details', async () => {
      const submittedAt = new Date()
      const studentAssignments: StudentAssignmentCompletionRow[] = [
        {
          firstName: 'Jane',
          lastName: 'Doe',
          submittedAt,
        },
        {
          firstName: 'John',
          lastName: 'Smith',
          submittedAt: null,
        },
      ]

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
        studentAssignments: [
          {
            firstName: 'Jane',
            lastName: 'Doe',
            submittedAt: submittedAt.toISOString(),
          },
          {
            firstName: 'John',
            lastName: 'Smith',
            submittedAt: null,
          },
        ],
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

  describe('PUT /api/assignment/upload', () => {
    test('uploads files and returns 200', async () => {
      mockedAssignmentsService.uploadAssignment.mockResolvedValueOnce()

      const response = await agent
        .put('/api/assignment/upload')
        .field('assignmentId', ASSIGNMENT_ID)
        .attach('files', Buffer.from('file-one'), 'first.txt')
        .attach('files', Buffer.from('file-two'), 'second.txt')

      expect(response.status).toBe(200)
      expect(mockedAssignmentsService.uploadAssignment).toHaveBeenCalledTimes(1)

      const [calledAssignmentId, files] =
        mockedAssignmentsService.uploadAssignment.mock.calls[0]

      expect(calledAssignmentId).toBe(ASSIGNMENT_ID)
      expect(files).toHaveLength(2)
      expect(files[0]?.originalname).toBe('first.txt')
      expect(files[1]?.originalname).toBe('second.txt')
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
