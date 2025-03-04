import { mocked } from 'jest-mock'
import * as AssignmentsService from '../../services/AssignmentsService'
import * as TeacherService from '../../services/TeacherService'
import * as StudentRepo from '../../models/Student'
import * as SubjectsRepo from '../../models/Subjects'
import * as TeacherRepo from '../../models/Teacher'

jest.mock('../../models/Student')
jest.mock('../../models/Subjects')
jest.mock('../../models/Teacher')
jest.mock('../../services/AssignmentsService')
const mockedStudentRepo = mocked(StudentRepo)
const mockedSubjectsRepo = mocked(SubjectsRepo)
const mockedTeacherRepo = mocked(TeacherRepo)
const mockedAssignmentsService = mocked(AssignmentsService)

describe('createTeacherClass', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('creates the teacher class', async () => {
    const teacherClass = {
      id: 'new-class',
      userId: 'userId',
      code: 'C0D3',
      name: 'teacherClassName',
      active: true,
      topicId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockedTeacherRepo.createTeacherClass.mockResolvedValue(teacherClass)

    const result = await TeacherService.createTeacherClass(
      teacherClass.userId,
      teacherClass.name
    )

    expect(mockedTeacherRepo.createTeacherClass).toHaveBeenCalledWith(
      {
        userId: teacherClass.userId,
        name: teacherClass.name,
        code: expect.any(String),
      },
      expect.toBeTransactionClient()
    )
    expect(mockedSubjectsRepo.getTopics).not.toHaveBeenCalled()
    expect(result).toEqual(teacherClass)
  })

  test('creates the teacher class with topic', async () => {
    const teacherClass = {
      id: 'new-class',
      userId: 'userId',
      code: 'C0D3',
      name: 'teacherClassName',
      active: true,
      topicId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const topic = {
      id: 1,
      name: 'math',
      displayName: 'Math',
      dashboardOrder: 1,
      trainingOrder: 1,
    }
    mockedTeacherRepo.createTeacherClass.mockResolvedValue(teacherClass)
    mockedSubjectsRepo.getTopics.mockResolvedValue([topic])

    const result = await TeacherService.createTeacherClass(
      teacherClass.userId,
      teacherClass.name,
      topic.id
    )

    expect(mockedTeacherRepo.createTeacherClass).toHaveBeenCalledWith(
      {
        userId: teacherClass.userId,
        name: teacherClass.name,
        code: expect.any(String),
        topicId: topic.id,
      },
      expect.toBeTransactionClient()
    )
    expect(mockedSubjectsRepo.getTopics).toHaveBeenCalledWith(
      topic.id,
      expect.toBeTransactionClient()
    )
    expect(result).toEqual({ ...teacherClass, topic })
  })

  test('throws error if cannot find unique class code after 5 attempts', async () => {
    mockedTeacherRepo.getTeacherClassByClassCode
      .mockResolvedValueOnce({
        id: 'a',
        cleverId: undefined,
        userId: 'a',
        code: 'a',
        name: 'a',
        active: true,
        topicId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        deactivatedOn: undefined,
      })
      .mockResolvedValueOnce({
        id: 'b',
        cleverId: undefined,
        userId: 'b',
        code: 'b',
        name: 'b',
        active: true,
        topicId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        deactivatedOn: undefined,
      })
      .mockResolvedValueOnce({
        id: 'c',
        cleverId: undefined,
        userId: 'c',
        code: 'c',
        name: 'c',
        active: true,
        topicId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        deactivatedOn: undefined,
      })
      .mockResolvedValueOnce({
        id: 'd',
        cleverId: undefined,
        userId: 'd',
        code: 'd',
        name: 'd',
        active: true,
        topicId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        deactivatedOn: undefined,
      })
      .mockResolvedValueOnce({
        id: 'e',
        cleverId: undefined,
        userId: 'e',
        code: 'e',
        name: 'e',
        active: true,
        topicId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        deactivatedOn: undefined,
      })

    await expect(async () => {
      await TeacherService.createTeacherClass('userId', 'className')
    }).rejects.toThrow(new Error('Could not generate unique class code.'))
    expect(mockedTeacherRepo.getTeacherClassByClassCode).toHaveBeenCalledTimes(
      5
    )
  })
  test('does not throw error if finds unique class code on 5th attempt', async () => {
    mockedTeacherRepo.getTeacherClassByClassCode
      .mockResolvedValueOnce({
        id: 'a',
        cleverId: undefined,
        userId: 'a',
        code: 'a',
        name: 'a',
        active: true,
        topicId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        deactivatedOn: undefined,
      })
      .mockResolvedValueOnce({
        id: 'b',
        cleverId: undefined,
        userId: 'b',
        code: 'b',
        name: 'b',
        active: true,
        topicId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        deactivatedOn: undefined,
      })
      .mockResolvedValueOnce({
        id: 'c',
        cleverId: undefined,
        userId: 'c',
        code: 'c',
        name: 'c',
        active: true,
        topicId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        deactivatedOn: undefined,
      })
      .mockResolvedValueOnce({
        id: 'd',
        cleverId: undefined,
        userId: 'd',
        code: 'd',
        name: 'd',
        active: true,
        topicId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        deactivatedOn: undefined,
      })
      .mockResolvedValueOnce(undefined)

    await TeacherService.createTeacherClass('userId', 'className')
    expect(mockedTeacherRepo.getTeacherClassByClassCode).toHaveBeenCalledTimes(
      5
    )
  })
})

describe('getStudentsInTeacherClass', () => {
  test('returns a list of student profiles of the students in the class', async () => {
    const studentIds = ['a', 'b', 'c']
    const classId = 'class-id'
    mockedTeacherRepo.getStudentIdsInTeacherClass.mockResolvedValue(studentIds)

    await TeacherService.getStudentsInTeacherClass(classId)

    expect(mockedTeacherRepo.getStudentIdsInTeacherClass).toHaveBeenCalledWith(
      expect.toBeTransactionClient(),
      classId
    )
    expect(mockedStudentRepo.getStudentProfilesByUserIds).toHaveBeenCalledWith(
      expect.toBeTransactionClient(),
      studentIds
    )
  })
})

describe('getTeacherSchoolIdFromClassCode', () => {
  test(`returns the teacher's school id`, async () => {
    const teacherClass = {
      id: 'teacher-class-id',
      cleverId: undefined,
      userId: 'teacher-id',
      name: 'teacher-class-name',
      code: 'C0D3',
      active: true,
      topicId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      deactivatedOn: undefined,
    }
    const teacher = {
      userId: teacherClass.userId,
      schoolId: 'teacher-school-id',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockedTeacherRepo.getTeacherClassByClassCode.mockResolvedValue(teacherClass)
    mockedTeacherRepo.getTeacherById.mockResolvedValue(teacher)

    const result = await TeacherService.getTeacherSchoolIdFromClassCode('C0D3')

    expect(result).toBe(teacher.schoolId)
  })

  test('returns undefined if no class with the class code', async () => {
    mockedTeacherRepo.getTeacherClassByClassCode.mockResolvedValue(undefined)
    const result =
      await TeacherService.getTeacherSchoolIdFromClassCode('@noth3R-C0D3')
    expect(result).toBeUndefined()
  })

  test('returns undefined if no teacher found with userId', async () => {
    const teacherClass = {
      id: 'teacher-class-id',
      cleverId: undefined,
      userId: 'teacher-id',
      name: 'teacher-class-name',
      code: 'C0D3',
      active: true,
      topicId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      deactivatedOn: undefined,
    }
    mockedTeacherRepo.getTeacherClassByClassCode.mockResolvedValue(teacherClass)
    mockedTeacherRepo.getTeacherById.mockResolvedValue(undefined)

    const result =
      await TeacherService.getTeacherSchoolIdFromClassCode('mo@r-c0d3')
    expect(result).toBeUndefined()
  })
})

describe('addStudentToTeacherClass', () => {
  test('adds a student to a teacher class', async () => {
    const teacherClass = {
      id: 'teacher-class-id',
      cleverId: undefined,
      userId: 'teacher-id',
      name: 'teacher-class-name',
      code: 'mo@r-c0d3',
      active: true,
      topicId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      deactivatedOn: undefined,
    }
    mockedTeacherRepo.getTeacherClassByClassCode.mockResolvedValue(teacherClass)

    const result = await TeacherService.addStudentToTeacherClassByClassCode(
      teacherClass.userId,
      teacherClass.code
    )

    expect(mockedStudentRepo.addStudentsToTeacherClass).toHaveBeenCalledWith(
      [teacherClass.userId],
      teacherClass.id,
      expect.toBeTransactionClient()
    )
    expect(result).toBe(teacherClass)
  })

  test('adds the student to all the class assignments', async () => {
    const teacherClass = {
      id: 'classId',
      cleverId: undefined,
      userId: 'teacher-id',
      name: 'class name',
      code: 'AAA111',
      active: true,
      topicId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      deactivatedOn: undefined,
    }

    mockedTeacherRepo.getTeacherClassByClassCode.mockResolvedValue(teacherClass)

    await TeacherService.addStudentToTeacherClassByClassCode(
      'studentId',
      teacherClass.code
    )

    expect(
      mockedAssignmentsService.addStudentsToClassAssignments
    ).toHaveBeenCalledWith(
      ['studentId'],
      teacherClass.id,
      expect.toBeTransactionClient()
    )
  })

  test('throws error if no class with the class code', async () => {
    mockedTeacherRepo.getTeacherClassByClassCode.mockResolvedValue(undefined)
    expect(async () => {
      await TeacherService.addStudentToTeacherClassByClassCode(
        'teacher-id',
        'class-code'
      )
    }).rejects.toThrow()
  })
})
