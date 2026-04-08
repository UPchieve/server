import { mocked } from 'jest-mock'
import request, { Response } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { routeTeachers } from '../../../router/api/teachers'
import * as TeacherService from '../../../services/TeacherService'
import * as AssignmentsService from '../../../services/AssignmentsService'
import {
  buildAssignment,
  buildEditedAssignmentPayload,
  buildStudentUserProfile,
  buildTeacherClass,
  buildTeacherClassWithStudents,
  buildAssignmentPayload,
  buildUser,
  buildGetTopicsResult,
  buildTeacherClassByClassCode,
} from '../../mocks/generate'
import { getUuid } from '../../../models/pgUtils'

jest.mock('../../../services/TeacherService')
jest.mock('../../../services/AssignmentsService')

const mockedTeacherService = mocked(TeacherService)
const mockedAssignmentsService = mocked(AssignmentsService)

let mockUser = buildUser()

function mockGetUser() {
  return mockUser
}

const router = mockRouter()
routeTeachers(router)

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

function sendDelete(path: string): Promise<Response> {
  return agent.delete(path).set('Accept', 'application/json')
}

describe('routeTeachers', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildUser()
  })

  describe('POST /api/teachers/class', () => {
    test('creates teacher class', async () => {
      const teacherClass = buildTeacherClass()
      const topic = buildGetTopicsResult()
      const mockTeacherClass = {
        ...teacherClass,
        topic,
      }
      mockedTeacherService.createTeacherClass.mockResolvedValueOnce(
        mockTeacherClass
      )

      const response = await sendPost('/api/teachers/class', {
        className: teacherClass.name,
        topicId: topic.id,
      })
      expect(response.status).toBe(200)
      expect(mockedTeacherService.createTeacherClass).toHaveBeenCalledWith(
        mockUser.id,
        teacherClass.name,
        topic.id
      )
      expect(response.body).toEqual({
        teacherClass: {
          ...teacherClass,
          topic,
          createdAt: teacherClass.createdAt.toISOString(),
          updatedAt: teacherClass.updatedAt.toISOString(),
        },
      })
    })

    test('creates teacher class with null topic id when omitted', async () => {
      const teacherClass = buildTeacherClass()
      const mockTeacherClass = {
        ...teacherClass,
        topic: undefined,
      }
      //   NOTE: topic is technically undefined when no topicId is provided
      mockedTeacherService.createTeacherClass.mockResolvedValueOnce(
        mockTeacherClass
      )

      const response = await sendPost('/api/teachers/class', {
        className: teacherClass.name,
      })
      expect(response.status).toBe(200)
      expect(mockedTeacherService.createTeacherClass).toHaveBeenCalledWith(
        mockUser.id,
        teacherClass.name,
        null
      )
      expect(response.body).toEqual({
        teacherClass: {
          ...teacherClass,
          topic: undefined,
          createdAt: teacherClass.createdAt.toISOString(),
          updatedAt: teacherClass.updatedAt.toISOString(),
        },
      })
    })
  })

  describe('GET /api/teachers/classes', () => {
    test('returns teacher classes', async () => {
      const teacherClasses = [
        buildTeacherClassWithStudents(),
        buildTeacherClassWithStudents(),
      ]
      mockedTeacherService.getTeacherClasses.mockResolvedValueOnce(
        teacherClasses
      )

      const response = await sendGet('/api/teachers/classes')
      expect(response.status).toBe(200)
      expect(mockedTeacherService.getTeacherClasses).toHaveBeenCalledWith(
        mockUser.id
      )
      expect(response.body).toEqual({
        teacherClasses: teacherClasses.map((teacherClass) => ({
          ...teacherClass,
          students: teacherClass.students.map((student) => {
            return {
              ...student,
              createdAt: student.createdAt.toISOString(),
              updatedAt: student.updatedAt.toISOString(),
            }
          }),
          createdAt: teacherClass.createdAt.toISOString(),
          updatedAt: teacherClass.updatedAt.toISOString(),
        })),
      })
    })
  })

  describe('GET /api/teachers/class/:classId/students', () => {
    test('returns students in teacher class', async () => {
      const classId = getUuid()
      const students = [buildStudentUserProfile(), buildStudentUserProfile()]
      mockedTeacherService.getStudentsInTeacherClass.mockResolvedValueOnce(
        students
      )

      const response = await sendGet(`/api/teachers/class/${classId}/students`)
      expect(response.status).toBe(200)
      expect(
        mockedTeacherService.getStudentsInTeacherClass
      ).toHaveBeenCalledWith(classId)
      expect(response.body).toEqual({
        students: students.map((student) => ({
          ...student,
          createdAt: student.createdAt.toISOString(),
          updatedAt: student.updatedAt.toISOString(),
        })),
      })
    })
  })

  describe('GET /api/teachers/class', () => {
    test('returns teacher class by class code', async () => {
      const teacherClass = buildTeacherClassByClassCode()
      const classCode = teacherClass.code
      mockedTeacherService.getTeacherClassByClassCode.mockResolvedValueOnce(
        teacherClass
      )

      const response = await sendGet(
        `/api/teachers/class?classCode=${classCode}`
      )
      expect(response.status).toBe(200)
      expect(
        mockedTeacherService.getTeacherClassByClassCode
      ).toHaveBeenCalledWith(classCode)
      expect(response.body).toEqual({
        teacherClass: {
          ...teacherClass,
          createdAt: teacherClass.createdAt.toISOString(),
          updatedAt: teacherClass.updatedAt.toISOString(),
          deactivatedOn: teacherClass.deactivatedOn.toISOString(),
        },
      })
    })
  })

  describe('GET /api/teachers/class/:classId', () => {
    test('returns teacher class by id', async () => {
      const classId = getUuid()
      const teacherClass = buildTeacherClass()
      //   TODO: The underlying type must be updated first
      mockedTeacherService.getTeacherClassById.mockResolvedValueOnce(
        teacherClass
      )

      const response = await sendGet(`/api/teachers/class/${classId}`)
      expect(response.status).toBe(200)
      expect(mockedTeacherService.getTeacherClassById).toHaveBeenCalledWith(
        classId
      )
      expect(response.body).toEqual({
        teacherClass: {
          ...teacherClass,
          createdAt: teacherClass.createdAt.toISOString(),
          updatedAt: teacherClass.updatedAt.toISOString(),
        },
      })
    })
  })

  describe('POST /api/teachers/class/update', () => {
    test('updates teacher class', async () => {
      const newClassName = 'Algebra 2'
      const topicId = 2
      const updatedClass = buildTeacherClass({ name: newClassName, topicId })
      const id = getUuid()
      //   TODO: The underlying type must be updated first
      mockedTeacherService.updateTeacherClass.mockResolvedValueOnce(
        updatedClass
      )

      const response = await sendPost('/api/teachers/class/update', {
        id,
        className: updatedClass.name,
        topicId,
      })

      expect(response.status).toBe(200)
      expect(mockedTeacherService.updateTeacherClass).toHaveBeenCalledWith(
        id,
        updatedClass.name,
        topicId
      )
      expect(response.body).toEqual({
        updatedClass: {
          ...updatedClass,
          createdAt: updatedClass.createdAt.toISOString(),
          updatedAt: updatedClass.updatedAt.toISOString(),
        },
      })
    })
  })

  describe('POST /api/teachers/class/deactivate', () => {
    test('deactivates teacher class', async () => {
      const id = getUuid()
      const updatedClass = buildTeacherClass({ active: false })
      //   TODO: The underlying type must be updated first
      mockedTeacherService.deactivateTeacherClass.mockResolvedValueOnce(
        updatedClass
      )

      const response = await sendPost('/api/teachers/class/deactivate', { id })
      expect(response.status).toBe(200)
      expect(mockedTeacherService.deactivateTeacherClass).toHaveBeenCalledWith(
        id
      )
      expect(response.body).toEqual({
        updatedClass: {
          ...updatedClass,
          createdAt: updatedClass.createdAt.toISOString(),
          updatedAt: updatedClass.updatedAt.toISOString(),
        },
      })
    })
  })

  describe('DELETE /api/teachers/class/:classId/student/:studentId/remove', () => {
    test('removes student from class', async () => {
      const classId = getUuid()
      const studentId = getUuid()
      const removedList = [{ studentId }]
      //   TODO: The underlying type must be updated first. Mismatch on pgTyped type
      mockedTeacherService.removeStudentFromClass.mockResolvedValueOnce(
        removedList
      )

      const response = await sendDelete(
        `/api/teachers/class/${classId}/student/${studentId}/remove`
      )
      expect(response.status).toBe(200)
      expect(mockedTeacherService.removeStudentFromClass).toHaveBeenCalledWith(
        studentId,
        classId
      )
      expect(response.body).toEqual({ removedId: removedList })
    })
  })

  describe('POST /api/teachers/assignment', () => {
    test('creates assignment', async () => {
      const assignmentData = buildAssignmentPayload()
      const assignment = buildAssignment()
      mockedAssignmentsService.asAssignment.mockReturnValueOnce(assignmentData)
      mockedAssignmentsService.createAssignment.mockResolvedValueOnce(
        assignment
      )

      const response = await sendPost('/api/teachers/assignment', {
        assignmentData,
        studentIds: assignmentData.studentIds,
      })
      expect(response.status).toBe(200)
      expect(mockedAssignmentsService.asAssignment).toHaveBeenCalledWith(
        {
          ...assignmentData,
          startDate: assignmentData.startDate.toISOString(),
          dueDate: assignmentData.dueDate.toISOString(),
        },
        assignmentData.studentIds
      )
      expect(mockedAssignmentsService.createAssignment).toHaveBeenCalledWith(
        assignmentData
      )
      expect(response.body).toEqual({
        assignment: {
          ...assignment,
          createdAt: assignment.createdAt.toISOString(),
          updatedAt: assignment.updatedAt.toISOString(),
          dueDate: assignment.dueDate?.toISOString(),
          startDate: assignment.startDate?.toISOString(),
        },
      })
    })
  })

  describe('GET /api/teachers/class/:classId/assignments', () => {
    test('returns assignments by class id', async () => {
      const classId = getUuid()
      const assignments = [buildAssignment(), buildAssignment()]
      mockedAssignmentsService.getAssignmentsByClassId.mockResolvedValueOnce(
        assignments
      )

      const response = await sendGet(
        `/api/teachers/class/${classId}/assignments`
      )
      expect(response.status).toBe(200)
      expect(
        mockedAssignmentsService.getAssignmentsByClassId
      ).toHaveBeenCalledWith(classId)
      expect(response.body).toEqual({
        assignments: assignments.map((assignment) => ({
          ...assignment,
          createdAt: assignment.createdAt.toISOString(),
          updatedAt: assignment.updatedAt.toISOString(),
          dueDate: assignment.dueDate?.toISOString(),
          startDate: assignment.startDate?.toISOString(),
        })),
      })
    })
  })

  describe('GET /api/teachers/assignments', () => {
    test('returns all assignments for teacher', async () => {
      const assignments = [buildAssignment(), buildAssignment()]
      mockedAssignmentsService.getAllAssignmentsForTeacher.mockResolvedValueOnce(
        assignments
      )

      const response = await sendGet('/api/teachers/assignments')
      expect(response.status).toBe(200)
      expect(
        mockedAssignmentsService.getAllAssignmentsForTeacher
      ).toHaveBeenCalledWith(mockUser.id)
      expect(response.body).toEqual({
        assignments: assignments.map((assignment) => ({
          ...assignment,
          createdAt: assignment.createdAt.toISOString(),
          updatedAt: assignment.updatedAt.toISOString(),
          dueDate: assignment.dueDate?.toISOString(),
          startDate: assignment.startDate?.toISOString(),
        })),
      })
    })
  })

  describe('POST /api/teachers/assignment/edit', () => {
    test('edits assignment', async () => {
      const assignmentData = buildEditedAssignmentPayload()
      const assignment = buildAssignment()
      mockedAssignmentsService.asEditedAssignment.mockReturnValueOnce(
        assignmentData
      )
      mockedAssignmentsService.editAssignment.mockResolvedValueOnce(assignment)

      const response = await sendPost('/api/teachers/assignment/edit', {
        assignmentData,
      })
      expect(response.status).toBe(200)
      expect(mockedAssignmentsService.asEditedAssignment).toHaveBeenCalledWith({
        ...assignmentData,
        startDate: assignmentData.startDate.toISOString(),
        dueDate: assignmentData.dueDate.toISOString(),
      })
      expect(mockedAssignmentsService.editAssignment).toHaveBeenCalledWith(
        assignmentData
      )
      expect(response.body).toEqual({
        assignment: {
          ...assignment,
          createdAt: assignment.createdAt.toISOString(),
          updatedAt: assignment.updatedAt.toISOString(),
          dueDate: assignment.dueDate?.toISOString(),
          startDate: assignment.startDate?.toISOString(),
        },
      })
    })
  })
})
