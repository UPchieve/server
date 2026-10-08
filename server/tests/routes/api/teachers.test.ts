import { mocked } from 'jest-mock'
import request, { Response } from 'supertest'
import { mockApp, mockPassportMiddleware, mockRouter } from '../../mock-app'
import { routeTeachers } from '../../../router/api/teachers'
import * as TeacherService from '../../../services/TeacherService'
import * as AssignmentsService from '../../../services/AssignmentsService'
import {
  buildAssignment,
  buildAssignmentPublic,
  buildStudentUserProfile,
  buildStudentUserProfilePublic,
  buildTeacherClass,
  buildTeacherClassPublic,
  buildTeacherClassWithStudents,
  buildAssignmentPayload,
  buildUser,
} from '../../mocks/generate'
import { getUuid } from '../../../models/pgUtils'
import { RoleContext } from '../../../services/UserRolesService'

jest.mock('../../../services/TeacherService')
jest.mock('../../../services/AssignmentsService')

const mockedTeacherService = mocked(TeacherService)
const mockedAssignmentsService = mocked(AssignmentsService)

let mockUser = buildUser({
  roles: ['teacher'],
  roleContext: new RoleContext(['teacher'], 'teacher', 'teacher'),
})
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

function sendPutAssignmentData(
  path: string,
  assignmentData: object
): Promise<Response> {
  return fieldAssignmentData(agent.put(path), assignmentData)
}

function sendPostAssignmentData(
  path: string,
  assignmentData: object
): Promise<Response> {
  return fieldAssignmentData(agent.post(path), assignmentData)
}

function sendPutWithFiles(
  path: string,
  assignmentData: object
): Promise<Response> {
  return attachFiles(agent.put(path), assignmentData)
}

function sendPostWithFiles(
  path: string,
  assignmentData: object
): Promise<Response> {
  return attachFiles(agent.post(path), assignmentData)
}

function fieldAssignmentData(
  req: request.Test,
  assignmentData: object
): request.Test {
  return req.field('assignmentData', JSON.stringify(assignmentData))
}

function attachFiles(
  req: request.Test,
  assignmentData: object
): Promise<Response> {
  return fieldAssignmentData(req, assignmentData)
    .attach('files', Buffer.from('file-one'), 'first.jpg')
    .attach('files', Buffer.from('file-two'), 'second.png')
}

describe('routeTeachers', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockUser = buildUser({
      roles: ['teacher'],
      roleContext: new RoleContext(['teacher'], 'teacher', 'teacher'),
    })
  })

  describe('POST /api/teachers/class', () => {
    test('creates teacher class', async () => {
      const teacherClass = buildTeacherClass()
      mockedTeacherService.createTeacherClass.mockResolvedValueOnce(
        teacherClass
      )

      const response = await sendPost('/api/teachers/class', {
        className: teacherClass.name,
        topicId: teacherClass.topicId,
      })
      expect(response.status).toBe(200)
      expect(mockedTeacherService.createTeacherClass).toHaveBeenCalledWith(
        mockUser.id,
        teacherClass.name,
        teacherClass.topicId
      )
      expect(response.body).toEqual({
        teacherClass: buildTeacherClassPublic(teacherClass),
      })
    })

    test('creates teacher class with null topic id when omitted', async () => {
      const teacherClass = buildTeacherClass({ topicId: undefined })
      mockedTeacherService.createTeacherClass.mockResolvedValueOnce(
        teacherClass
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
        teacherClass: buildTeacherClassPublic(teacherClass),
      })
    })
  })

  describe('GET /api/teachers/classes', () => {
    test('returns teacher classes', async () => {
      const teacherClasses = [
        buildTeacherClassWithStudents({
          cleverId: 'clever-class',
          totalStudents: 2,
          deactivatedOn: new Date(),
        }),
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
          ...buildTeacherClassPublic(teacherClass),
          students: teacherClass.students.map((student) =>
            buildStudentUserProfilePublic(student)
          ),
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
        students: students.map((student) =>
          buildStudentUserProfilePublic(student)
        ),
      })
    })
  })

  describe('GET /api/teachers/class', () => {
    test('returns teacher class by class code', async () => {
      const teacherClass = buildTeacherClass({
        cleverId: 'clever-class',
        deactivatedOn: new Date(),
      })
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
        teacherClass: buildTeacherClassPublic(teacherClass),
      })
    })
  })

  describe('GET /api/teachers/class/:classId', () => {
    test('returns an empty object when the class does not exist', async () => {
      const classId = getUuid()
      mockedTeacherService.getTeacherClassById.mockResolvedValueOnce(undefined)

      const response = await sendGet(`/api/teachers/class/${classId}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({})
      expect(mockedTeacherService.getTeacherClassById).toHaveBeenCalledWith(
        classId
      )
    })

    test('returns teacher class by id', async () => {
      const classId = getUuid()
      const teacherClass = buildTeacherClass()
      mockedTeacherService.getTeacherClassById.mockResolvedValueOnce(
        teacherClass
      )

      const response = await sendGet(`/api/teachers/class/${classId}`)
      expect(response.status).toBe(200)
      expect(mockedTeacherService.getTeacherClassById).toHaveBeenCalledWith(
        classId
      )
      expect(response.body).toEqual({
        teacherClass: buildTeacherClassPublic(teacherClass),
      })
    })
  })

  describe('POST /api/teachers/class/update', () => {
    test('updates teacher class', async () => {
      const newClassName = 'Algebra 2'
      const topicId = 2
      const updatedClass = buildTeacherClass({ name: newClassName, topicId })
      const id = getUuid()
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
        updatedClass: buildTeacherClassPublic(updatedClass),
      })
    })
  })

  describe('POST /api/teachers/class/deactivate', () => {
    test('deactivates teacher class', async () => {
      const id = getUuid()
      const updatedClass = buildTeacherClass({ active: false })
      mockedTeacherService.deactivateTeacherClass.mockResolvedValueOnce(
        updatedClass
      )

      const response = await sendPost('/api/teachers/class/deactivate', { id })
      expect(response.status).toBe(200)
      expect(mockedTeacherService.deactivateTeacherClass).toHaveBeenCalledWith(
        id
      )
      expect(response.body).toEqual({
        updatedClass: buildTeacherClassPublic(updatedClass),
      })
    })
  })

  describe('DELETE /api/teachers/class/:classId/student/:studentId/remove', () => {
    test('removes student from class', async () => {
      const classId = getUuid()
      const studentId = getUuid()
      const removedList = [{ studentId }]
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
      expect(response.body).toEqual({
        removedId: [{ studentId, studentid: studentId }],
      })
    })
  })

  describe('PUT /api/teachers/assignment', () => {
    test('preserves the saved assignment when an attached file is flagged', async () => {
      const assignmentData = buildAssignmentPayload()
      const assignment = buildAssignment(assignmentData)
      const imageModerationInfractions = { 'first.jpg': ['GRAPHIC'] }
      mockedAssignmentsService.asAssignment.mockReturnValueOnce(assignmentData)
      mockedAssignmentsService.upsertAssignment.mockResolvedValueOnce({
        assignment: { ...assignment, isCreated: true },
        imageModerationInfractions,
      })

      const response = await sendPutWithFiles(
        '/api/teachers/assignment',
        assignmentData
      )

      expect(response.status).toBe(422)
      expect(response.body).toEqual({
        imageModerationInfractions,
        assignment: {
          ...buildAssignmentPublic(assignment),
          studentIds: assignment.studentIds,
          isCreated: true,
        },
      })
    })

    test('creates assignment if not already created', async () => {
      const assignmentData = buildAssignmentPayload()
      const assignment = buildAssignment(assignmentData)
      mockedAssignmentsService.asAssignment.mockReturnValueOnce(assignmentData)
      mockedAssignmentsService.upsertAssignment.mockResolvedValueOnce({
        assignment: { ...assignment, isCreated: true },
      })

      const response = await sendPutAssignmentData(
        '/api/teachers/assignment',
        assignmentData
      )
      expect(response.status).toBe(201)
      expect(mockedAssignmentsService.upsertAssignment).toHaveBeenCalledWith(
        mockUser.id,
        assignmentData,
        []
      )
      expect(response.body).toEqual({
        assignment: {
          ...buildAssignmentPublic(assignment),
          studentIds: assignment.studentIds,
          isCreated: true,
        },
      })
    })

    test('edits assignment if already created', async () => {
      const assignmentData = buildAssignmentPayload({ id: getUuid() })
      const assignment = buildAssignment()
      mockedAssignmentsService.asAssignment.mockReturnValueOnce(assignmentData)
      mockedAssignmentsService.upsertAssignment.mockResolvedValueOnce({
        assignment: { ...assignment, isCreated: false },
      })

      const response = await sendPutAssignmentData(
        '/api/teachers/assignment',
        assignmentData
      )
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        assignment: {
          ...buildAssignmentPublic(assignment),
          studentIds: assignment.studentIds,
          isCreated: false,
        },
      })
    })

    test('passes the attached files along with the assignment', async () => {
      const assignmentData = buildAssignmentPayload()
      const assignment = buildAssignment(assignmentData)
      mockedAssignmentsService.asAssignment.mockReturnValueOnce(assignmentData)
      mockedAssignmentsService.upsertAssignment.mockResolvedValueOnce({
        assignment: { ...assignment, isCreated: true },
      })

      const response = await sendPutWithFiles(
        '/api/teachers/assignment',
        assignmentData
      )

      expect(response.status).toBe(201)
      const [calledUserId, calledData, files] =
        mockedAssignmentsService.upsertAssignment.mock.calls[0]
      expect(calledUserId).toBe(mockUser.id)
      expect(calledData).toEqual(assignmentData)
      expect(files?.map((file) => file.originalname)).toEqual([
        'first.jpg',
        'second.png',
      ])
    })

    test('returns 422 when an attached file is flagged', async () => {
      const assignmentData = buildAssignmentPayload()
      const imageModerationInfractions = { 'first.jpg': ['GRAPHIC'] }
      mockedAssignmentsService.asAssignment.mockReturnValueOnce(assignmentData)
      mockedAssignmentsService.upsertAssignment.mockResolvedValueOnce({
        imageModerationInfractions,
      })

      const response = await sendPutWithFiles(
        '/api/teachers/assignment',
        assignmentData
      )

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ imageModerationInfractions })
    })

    test('returns 422 when the title or description is flagged', async () => {
      const assignmentData = buildAssignmentPayload()
      const moderationInfractions = ['PROFANITY']
      mockedAssignmentsService.asAssignment.mockReturnValueOnce(assignmentData)
      mockedAssignmentsService.upsertAssignment.mockResolvedValueOnce({
        moderationInfractions,
      })

      const response = await sendPutAssignmentData(
        '/api/teachers/assignment',
        assignmentData
      )

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ moderationInfractions })
    })
  })

  describe('POST /api/teachers/assignments', () => {
    test('creates an assignment for every class', async () => {
      const assignmentData = {
        ...buildAssignmentPayload(),
        classIds: [getUuid(), getUuid()],
      }
      const assignments = assignmentData.classIds.map((classId) =>
        buildAssignment({ classId })
      )
      mockedAssignmentsService.asMultipleAssignments.mockReturnValueOnce(
        assignmentData
      )
      mockedAssignmentsService.createAssignmentForClasses.mockResolvedValueOnce(
        {
          assignments,
        }
      )

      const response = await sendPostAssignmentData(
        '/api/teachers/assignments',
        assignmentData
      )

      expect(response.status).toBe(201)
      expect(
        mockedAssignmentsService.createAssignmentForClasses
      ).toHaveBeenCalledWith(
        mockUser.id,
        assignmentData,
        assignmentData.classIds,
        []
      )
      expect(response.body).toEqual({
        assignments: assignments.map((assignment) => ({
          ...buildAssignmentPublic(assignment),
          studentIds: assignment.studentIds,
        })),
      })
    })

    test('passes the attached files along with the assignments', async () => {
      const assignmentData = {
        ...buildAssignmentPayload(),
        classIds: [getUuid()],
      }
      mockedAssignmentsService.asMultipleAssignments.mockReturnValueOnce(
        assignmentData
      )
      mockedAssignmentsService.createAssignmentForClasses.mockResolvedValueOnce(
        {
          assignments: [buildAssignment()],
        }
      )

      const response = await sendPostWithFiles(
        '/api/teachers/assignments',
        assignmentData
      )

      expect(response.status).toBe(201)
      const [calledUserId, calledData, calledClassIds, files] =
        mockedAssignmentsService.createAssignmentForClasses.mock.calls[0]
      expect(calledUserId).toBe(mockUser.id)
      expect(calledData).toEqual(assignmentData)
      expect(calledClassIds).toEqual(assignmentData.classIds)
      expect(files?.map((file) => file.originalname)).toEqual([
        'first.jpg',
        'second.png',
      ])
    })

    test('returns 422 when the title or description is flagged', async () => {
      const assignmentData = {
        ...buildAssignmentPayload(),
        classIds: [getUuid()],
      }
      const moderationInfractions = ['PROFANITY']
      mockedAssignmentsService.asMultipleAssignments.mockReturnValueOnce(
        assignmentData
      )
      mockedAssignmentsService.createAssignmentForClasses.mockResolvedValueOnce(
        {
          moderationInfractions,
        }
      )

      const response = await sendPostAssignmentData(
        '/api/teachers/assignments',
        assignmentData
      )

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ moderationInfractions })
      expect(
        mockedAssignmentsService.createAssignmentForClasses
      ).toHaveBeenCalled()
    })

    test('returns 422 when an attached file is flagged', async () => {
      const assignmentData = {
        ...buildAssignmentPayload(),
        classIds: [getUuid()],
      }
      const imageModerationInfractions = { 'first.jpg': ['GRAPHIC'] }
      mockedAssignmentsService.asMultipleAssignments.mockReturnValueOnce(
        assignmentData
      )
      mockedAssignmentsService.createAssignmentForClasses.mockResolvedValueOnce(
        {
          imageModerationInfractions,
        }
      )

      const response = await sendPostWithFiles(
        '/api/teachers/assignments',
        assignmentData
      )

      expect(response.status).toBe(422)
      expect(response.body).toEqual({ imageModerationInfractions })
    })
  })

  describe('GET /api/teachers/class/:classId/assignments', () => {
    test('returns assignments by class id', async () => {
      const classId = getUuid()
      const assignments = [
        buildAssignment({ studentIds: [getUuid(), getUuid()] }),
        buildAssignment(),
      ]
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
          ...buildAssignmentPublic(assignment),
          studentIds: assignment.studentIds,
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
          ...buildAssignmentPublic(assignment),
          studentIds: assignment.studentIds,
        })),
      })
    })
  })
})
