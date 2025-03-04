import _ from 'lodash'
import { mocked } from 'jest-mock'

import { getDbUlid } from '../../../database/seeds/utils'
import * as CleverAPIService from '../../services/CleverAPIService'
import * as CleverRosterService from '../../services/CleverRosterService'
import * as FederatedCredentialService from '../../services/FederatedCredentialService'
import * as StudentService from '../../services/StudentService'
import * as SubjectsService from '../../services/SubjectsService'
import * as TeacherService from '../../services/TeacherService'
import * as UserCreationService from '../../services/UserCreationService'
import { TeacherClass } from '../../models/Teacher'
import { TransactionClient } from '../../db'
import { CreateUserResult } from '../../models/User'

jest.mock('../../services/FederatedCredentialService')
const mockedFedCredService = FederatedCredentialService
jest.mock('../../services/StudentService')
const mockedStudentService = mocked(StudentService)
jest.mock('../../services/SubjectsService')
const mockedSubjectsService = mocked(SubjectsService)
jest.mock('../../services/TeacherService')
const mockedTeacherService = mocked(TeacherService)
jest.mock('../../services/UserCreationService')
const mockedUserCreationService = mocked(UserCreationService)

const TC = {} as TransactionClient

describe('rosterTeacherClasses', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('creates the classes to add and adds the students', async () => {
    const cleverStudents = [
      { id: 'cs-1', roles: { student: { grade: 6 } } },
      { id: 'cs-2', roles: { student: { grade: 8 } } },
      { id: 'cs-3', roles: { student: { grade: 12 } } },
    ]
    const cleverClasses = [
      {
        id: 'cc-1',
        name: 'CleverClass1',
        subject: 'math',
        students: ['cs-1'],
      },
      {
        id: 'cc-2',
        name: 'CleverClass2',
        subject: 'english/language arts',
        students: ['cs-1', 'cs-2', 'cs-3'],
      },
      {
        id: 'cc3',
        name: 'CleverClass3',
        subject: 'language',
        students: [],
      },
    ]
    const teacherId = 't-1'

    mockedTeacherService.getTeacherById.mockResolvedValue({
      userId: teacherId,
      schoolId: 's-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    mockedStudentService.getStudentByCleverId
      .mockResolvedValueOnce({
        id: 'ucs-1',
      })
      .mockResolvedValueOnce({
        id: 'ucs-2',
      })
      .mockResolvedValueOnce({
        id: 'ucs-3',
      })
    // No UPchieve classes, add all the Clever classes.
    mockedTeacherService.getTeacherClasses.mockResolvedValue([])
    mockedSubjectsService.getTopicIdFromName
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2)
    mockedTeacherService.createTeacherClass
      // @ts-ignore
      .mockResolvedValueOnce({
        id: 'newClass1',
      })
      // @ts-ignore
      .mockResolvedValueOnce({
        id: 'newClass2',
      })
      // @ts-ignore
      .mockResolvedValueOnce({
        id: 'newClass3',
      })

    await CleverRosterService.rosterTeacherClasses(
      teacherId,
      cleverClasses as unknown as CleverAPIService.TCleverSectionData[],
      cleverStudents as unknown as CleverAPIService.TCleverStudentData[]
    )

    expect(
      mockedTeacherService.removeStudentsFromTeacherClassById
    ).not.toHaveBeenCalled()
    expect(mockedTeacherService.deactivateTeacherClass).not.toHaveBeenCalled()

    expect(mockedTeacherService.createTeacherClass).toHaveBeenNthCalledWith(
      1,
      teacherId,
      cleverClasses[0].name,
      0,
      cleverClasses[0].id,
      expect.anything()
    )
    expect(mockedTeacherService.createTeacherClass).toHaveBeenNthCalledWith(
      2,
      teacherId,
      cleverClasses[1].name,
      1,
      cleverClasses[1].id,
      expect.anything()
    )
    expect(mockedTeacherService.createTeacherClass).toHaveBeenNthCalledWith(
      3,
      teacherId,
      cleverClasses[2].name,
      2,
      cleverClasses[2].id,
      expect.anything()
    )

    expect(
      mockedTeacherService.addStudentsToTeacherClassById
    ).toHaveBeenNthCalledWith(1, ['ucs-1'], 'newClass1', expect.anything())
    expect(
      mockedTeacherService.addStudentsToTeacherClassById
    ).toHaveBeenNthCalledWith(
      2,
      ['ucs-1', 'ucs-2', 'ucs-3'],
      'newClass2',
      expect.anything()
    )
    expect(
      mockedTeacherService.addStudentsToTeacherClassById
    ).toHaveBeenNthCalledWith(3, [], 'newClass3', expect.anything())
    expect(
      mockedTeacherService.updateLastSuccessfulCleverSync
    ).toHaveBeenCalledWith(teacherId, expect.anything())
  })

  test('adds or removes the students in the classes to update', async () => {
    const cleverStudents = [
      { id: 'cs-11', roles: { student: { grade: 7 } } },
      { id: 'cs-22', roles: { student: { grade: 9 } } },
      { id: 'cs-33', roles: { student: { grade: 11 } } },
    ]
    const cleverClasses = [
      {
        id: 'cc-11',
        name: 'CleverClass11',
        subject: 'math',
        students: ['cs-11', 'cs-33'],
      },
      {
        id: 'cc-22',
        name: 'CleverClass22',
        subject: 'english/language arts',
        students: ['cs-1', 'cs-22', 'cs-33'],
      },
      {
        id: 'cc-33',
        name: 'CleverClass33',
        subject: 'language',
        students: [],
      },
    ]
    const teacherId = 't-2'

    mockedTeacherService.getTeacherById.mockResolvedValue({
      userId: teacherId,
      schoolId: 's-2',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    mockedStudentService.getStudentByCleverId
      .mockResolvedValueOnce({
        id: 'ucs-11',
      })
      .mockResolvedValueOnce({
        id: 'ucs-22',
      })
      .mockResolvedValueOnce({
        id: 'ucs-33',
      })
    // All Clever classes exist in UPchieve - update all the students for those classes.
    mockedTeacherService.getTeacherClasses.mockResolvedValue([
      // @ts-ignore
      {
        id: 'ucc-11',
        cleverId: 'cc-11',
      },
      // @ts-ignore
      {
        id: 'ucc-22',
        cleverId: 'cc-22',
      },
      // @ts-ignore
      {
        id: 'ucc-33',
        cleverId: 'cc-33',
      },
    ])
    mockedTeacherService.getStudentIdsInTeacherClass
      // Add student cs-33 into class ucc-11.
      .mockResolvedValueOnce(['ucs-11'])
      // No change in class ucc-22.
      .mockResolvedValueOnce(['ucs-11', 'ucs-22', 'ucs-33'])
      // Remove both students in class ucc-33.
      .mockResolvedValueOnce(['ucs-22', 'ucs-33'])

    await CleverRosterService.rosterTeacherClasses(
      teacherId,
      cleverClasses as unknown as CleverAPIService.TCleverSectionData[],
      cleverStudents as unknown as CleverAPIService.TCleverStudentData[]
    )

    expect(mockedTeacherService.createTeacherClass).not.toHaveBeenCalled()
    expect(mockedTeacherService.deactivateTeacherClass).not.toHaveBeenCalled()

    expect(
      mockedTeacherService.addStudentsToTeacherClassById
    ).toHaveBeenCalledWith(['ucs-33'], 'ucc-11', expect.anything())
    expect(
      mockedTeacherService.removeStudentsFromTeacherClassById
    ).toHaveBeenCalledWith(['ucs-22', 'ucs-33'], 'ucc-33', expect.anything())
    expect(
      mockedTeacherService.updateLastSuccessfulCleverSync
    ).toHaveBeenCalledWith(teacherId, expect.anything())
  })

  test('archives the classes that no longer exist', async () => {
    const cleverStudents = [
      { id: 'cs-111', roles: { student: { grade: 10 } } },
      { id: 'cs-222', roles: { student: { grade: 9 } } },
      { id: 'cs-333', roles: { student: { grade: 6 } } },
    ]
    const teacherId = 't-3'

    mockedTeacherService.getTeacherById.mockResolvedValue({
      userId: teacherId,
      schoolId: 's-3',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    mockedStudentService.getStudentByCleverId
      .mockResolvedValueOnce({
        id: 'ucs-111',
      })
      .mockResolvedValueOnce({
        id: 'ucs-222',
      })
      .mockResolvedValueOnce({
        id: 'ucs-333',
      })
    // None of these classes exist in Clever anymore.
    mockedTeacherService.getTeacherClasses.mockResolvedValue([
      // @ts-ignore
      {
        id: 'ucc-111',
        cleverId: 'cc-111',
      },
      // @ts-ignore
      {
        id: 'ucc-222',
        cleverId: 'cc-222',
      },
      // @ts-ignore
      {
        id: 'ucc-333',
        cleverId: 'cc-333',
      },
    ])

    await CleverRosterService.rosterTeacherClasses(
      teacherId,
      [],
      cleverStudents as unknown as CleverAPIService.TCleverStudentData[]
    )

    expect(mockedTeacherService.createTeacherClass).not.toHaveBeenCalled()
    expect(
      mockedTeacherService.getStudentIdsInTeacherClass
    ).not.toHaveBeenCalled()
    expect(
      mockedTeacherService.addStudentsToTeacherClassById
    ).not.toHaveBeenCalled()
    expect(
      mockedTeacherService.removeStudentsFromTeacherClassById
    ).not.toHaveBeenCalled()

    expect(mockedTeacherService.deactivateTeacherClass).toHaveBeenNthCalledWith(
      1,
      'ucc-111',
      expect.anything()
    )
    expect(mockedTeacherService.deactivateTeacherClass).toHaveBeenNthCalledWith(
      2,
      'ucc-222',
      expect.anything()
    )
    expect(mockedTeacherService.deactivateTeacherClass).toHaveBeenNthCalledWith(
      3,
      'ucc-333',
      expect.anything()
    )
    expect(
      mockedTeacherService.updateLastSuccessfulCleverSync
    ).toHaveBeenCalledWith(teacherId, expect.anything())
  })

  describe('findOrCreateUpchieveStudent', () => {
    test('returns undefined if the student is not in a valid grade', async () => {
      const cleverStudent1 = {
        roles: {
          student: {
            grade: 5,
          },
        },
      }

      const ucStudent1 = await CleverRosterService.findOrCreateUpchieveStudent(
        cleverStudent1 as unknown as CleverAPIService.TCleverStudentData,
        'school-id',
        TC
      )
      expect(ucStudent1).toBe(undefined)

      const cleverStudent2 = {
        roles: {
          student: {
            grade: 13,
          },
        },
      }
      const ucStudent2 = await CleverRosterService.findOrCreateUpchieveStudent(
        cleverStudent2 as unknown as CleverAPIService.TCleverStudentData,
        'school-id',
        TC
      )
      expect(ucStudent2).toBe(undefined)

      const cleverStudent3 = {
        roles: {
          student: {
            grade: 'kindergarten',
          },
        },
      }
      const ucStudent3 = await CleverRosterService.findOrCreateUpchieveStudent(
        cleverStudent3 as unknown as CleverAPIService.TCleverStudentData,
        'school-id',
        TC
      )
      expect(ucStudent3).toBe(undefined)

      const cleverStudent4 = {
        roles: {
          student: {},
        },
      }
      const ucStudent4 = await CleverRosterService.findOrCreateUpchieveStudent(
        cleverStudent4 as unknown as CleverAPIService.TCleverStudentData,
        'school-id',
        TC
      )
      expect(ucStudent4).toBe(undefined)
    })

    test('can get the student by their Clever ID', async () => {
      const cleverStudent = {
        id: 'c-abc',
        roles: {
          student: {
            grade: 6,
          },
        },
      }
      mockedStudentService.getStudentByCleverId.mockResolvedValue({
        id: 'uc-abc',
      })

      const ucStudent = await CleverRosterService.findOrCreateUpchieveStudent(
        cleverStudent as unknown as CleverAPIService.TCleverStudentData,
        'school-id',
        TC
      )

      expect(ucStudent?.id).toBe('uc-abc')
      expect(mockedStudentService.getStudentByCleverId).toHaveBeenCalledWith(
        cleverStudent.id,
        expect.anything()
      )
    })

    test('can get the student by their email', async () => {
      const cleverStudent = {
        id: 'c-123',
        email: 'c@up.org',
        roles: {
          student: {
            grade: 12,
          },
        },
      }
      mockedStudentService.getStudentByCleverId.mockResolvedValue(undefined)
      mockedStudentService.getStudentByEmail.mockResolvedValue({
        id: 'uc-123',
      })

      const ucStudent = await CleverRosterService.findOrCreateUpchieveStudent(
        cleverStudent as unknown as CleverAPIService.TCleverStudentData,
        'school-id',
        TC
      )

      expect(ucStudent?.id).toBe('uc-123')
      expect(mockedStudentService.getStudentByCleverId).toHaveBeenCalledWith(
        cleverStudent.id,
        expect.anything()
      )
      expect(mockedStudentService.getStudentByEmail).toHaveBeenCalledWith(
        cleverStudent.email,
        expect.anything()
      )
      expect(mockedFedCredService.linkAccount).toHaveBeenCalledWith(
        cleverStudent.id,
        expect.any(String),
        ucStudent?.id,
        expect.anything()
      )
    })

    test('creates the student if does not already exist', async () => {
      const cleverStudent = {
        id: 'c-zzz',
        email: 'zzz@up.org',
        name: {
          first: 'zzz',
          last: 'yyy',
        },
        roles: {
          student: {
            grade: 10,
          },
        },
      }
      mockedStudentService.getStudentByCleverId.mockResolvedValue(undefined)
      mockedStudentService.getStudentByEmail.mockResolvedValue(undefined)
      mockedUserCreationService.registerStudent.mockResolvedValue({
        id: 'uc-zzz',
        isAdmin: false,
        isVolunteer: false,
        userType: 'student',
        firstName: 'any',
        proxyEmail: 'any',
        email: 'any',
      })

      const ucStudent = await CleverRosterService.findOrCreateUpchieveStudent(
        cleverStudent as unknown as CleverAPIService.TCleverStudentData,
        'school-id',
        TC
      )

      expect(ucStudent?.id).toBe('uc-zzz')
      expect(mockedStudentService.getStudentByCleverId).toHaveBeenCalledWith(
        cleverStudent.id,
        expect.anything()
      )
      expect(mockedStudentService.getStudentByEmail).toHaveBeenCalledWith(
        cleverStudent.email,
        expect.anything()
      )
      expect(mockedUserCreationService.registerStudent).toHaveBeenCalledWith(
        expect.objectContaining({
          email: cleverStudent.email,
          firstName: cleverStudent.name.first,
          issuer: expect.any(String),
          lastName: cleverStudent.name.last,
          profileId: cleverStudent.id,
          schoolId: 'school-id',
        }),
        expect.anything()
      )
    })
  })

  describe('categorizeTeacherClasses', () => {
    test('correctly categories classes to add, update, or remove', () => {
      const ucClasses = new Map<string, any>([
        ['update-this-class', {}],
        ['remove-this-class', {}],
      ])
      const cleverClasses = new Map<string, any>([
        ['add-this-class', {}],
        ['update-this-class', {}],
      ])

      const { classesToAdd, classesToUpdate, classesToRemove } =
        CleverRosterService.categorizeTeacherClasses(ucClasses, cleverClasses)

      expect(classesToAdd.length).toBe(1)
      expect(classesToAdd[0]).toBe('add-this-class')
      expect(classesToUpdate.length).toBe(1)
      expect(classesToUpdate[0]).toBe('update-this-class')
      expect(classesToRemove.length).toBe(1)
      expect(classesToRemove[0]).toBe('remove-this-class')
    })

    test('correctly categorizes as add all classes if none in UPchieve yet', () => {
      const ucClasses = new Map()
      const cleverClasses = new Map<string, any>([
        ['123', {}],
        ['456', {}],
        ['789', {}],
      ])

      const { classesToAdd, classesToUpdate, classesToRemove } =
        CleverRosterService.categorizeTeacherClasses(ucClasses, cleverClasses)

      expect(classesToAdd.length).toBe(3)
      expect(classesToUpdate.length).toBe(0)
      expect(classesToRemove.length).toBe(0)
    })

    test('correctly categorizes as update all classes if all the same', () => {
      const ucClasses = new Map<string, any>([
        ['aaa', {}],
        ['bbb', {}],
      ])
      const cleverClasses = new Map<string, any>([
        ['aaa', {}],
        ['bbb', {}],
      ])

      const { classesToAdd, classesToUpdate, classesToRemove } =
        CleverRosterService.categorizeTeacherClasses(ucClasses, cleverClasses)

      expect(classesToAdd.length).toBe(0)
      expect(classesToUpdate.length).toBe(2)
      expect(classesToRemove.length).toBe(0)
    })

    test('correctly categorizes as remove all classes if none the same', () => {
      const ucClasses = new Map<string, any>([
        ['a1z', {}],
        ['b2y', {}],
        ['c3x', {}],
        ['d4w', {}],
      ])
      const cleverClasses = new Map<string, any>([])

      const { classesToAdd, classesToUpdate, classesToRemove } =
        CleverRosterService.categorizeTeacherClasses(ucClasses, cleverClasses)

      expect(classesToAdd.length).toBe(0)
      expect(classesToUpdate.length).toBe(0)
      expect(classesToRemove.length).toBe(4)
    })
  })

  describe('categorizeStudentsInClass', () => {
    test('correctly categories students to add and remove', () => {
      const ucStudents = ['uc-1', 'uc-2', 'uc-3', 'uc-5']
      const cleverStudents = ['c-1', 'c-2', 'c-4', 'c-6']
      const mapOfAll = new Map<string, string>([
        ['c-1', 'uc-1'],
        ['c-2', 'uc-2'],
        ['c-3', 'uc-3'],
        ['c-4', 'uc-4'],
        ['c-5', 'uc-5'],
        ['c-6', 'uc-6'],
      ])

      const { studentsToAdd, studentsToRemove } =
        CleverRosterService.categorizeStudentsInClass(
          ucStudents,
          cleverStudents,
          mapOfAll
        )

      expect(studentsToAdd.length).toBe(2)
      expect(studentsToRemove.length).toBe(2)
      expect(studentsToAdd).toEqual(['uc-4', 'uc-6'])
      expect(studentsToRemove).toEqual(['uc-3', 'uc-5'])
    })

    test('correctly categories students to add', () => {
      const ucStudents: string[] = []
      const cleverStudents = ['c-11', 'c-22', 'c-33', 'c-44']
      const mapOfAll = new Map<string, string>([
        ['c-11', 'uc-11'],
        ['c-22', 'uc-22'],
        ['c-33', 'uc-33'],
        ['c-44', 'uc-44'],
      ])

      const { studentsToAdd, studentsToRemove } =
        CleverRosterService.categorizeStudentsInClass(
          ucStudents,
          cleverStudents,
          mapOfAll
        )

      expect(studentsToAdd.length).toBe(4)
      expect(studentsToRemove.length).toBe(0)
    })

    test('correctly categories students to remove', () => {
      const ucStudents = ['uc-aa', 'uc-bb', 'uc-cc', 'uc-dd']
      const cleverStudents: string[] = []
      const mapOfAll = new Map<string, string>([
        ['c-aa', 'uc-aa'],
        ['c-bb', 'uc-bb'],
        ['c-cc', 'uc-cc'],
        ['c-dd', 'uc-dd'],
      ])

      const { studentsToAdd, studentsToRemove } =
        CleverRosterService.categorizeStudentsInClass(
          ucStudents,
          cleverStudents,
          mapOfAll
        )

      expect(studentsToAdd.length).toBe(0)
      expect(studentsToRemove.length).toBe(4)
    })
  })
})
