import { mocked } from 'jest-mock'
import * as AssignmentsService from '../../services/AssignmentsService'
import * as AssignmentRepo from '../../models/Assignments'
import * as TeacherRepo from '../../models/Teacher'
import * as TeacherClassRepo from '../../models/TeacherClass'
import * as ModerationService from '../../services/ModerationService'
import moment from 'moment'
import { Assignment, StudentAssignment } from '../../models/Assignments'
import { TransactionClient } from '../../db'
import * as AzureService from '../../services/AzureService'
import * as ImageUtils from '../../utils/image-utils'
import { buildAssignment } from '../mocks/generate'

jest.mock('../../models/Assignments')
jest.mock('../../models/Teacher')
jest.mock('../../models/TeacherClass')
jest.mock('../../services/ModerationService')
jest.mock('../../services/AzureService')
jest.mock('../../utils/image-utils')
const mockedAssignmentRepo = mocked(AssignmentRepo)
const mockedTeacherRepo = mocked(TeacherRepo)
const mockedTeacherClassRepo = mocked(TeacherClassRepo)
const mockedModerationService = mocked(ModerationService)
const mockedAzureService = mocked(AzureService)
const mockedImageUtils = mocked(ImageUtils)

beforeEach(() => {
  jest.resetAllMocks()
})

describe('createAssignment', () => {
  beforeEach(() => {
    mockedModerationService.moderateAssignmentInfo.mockResolvedValue([])
  })

  test('throws an error if the minimum number of sessions is less than 0', async () => {
    const data = {
      numberOfSessions: -1,
    }
    await expect(
      AssignmentsService.createAssignment(
        data as AssignmentsService.CreateAssignmentPayload
      )
    ).rejects.toThrow('Number of sessions must be greater than 0.')

    data.numberOfSessions = -5
    await expect(
      AssignmentsService.createAssignment(
        data as AssignmentsService.CreateAssignmentPayload
      )
    ).rejects.toThrow('Number of sessions must be greater than 0.')

    data.numberOfSessions = -5690
    await expect(
      AssignmentsService.createAssignment(
        data as AssignmentsService.CreateAssignmentPayload
      )
    ).rejects.toThrow('Number of sessions must be greater than 0.')

    expect(mockedAssignmentRepo.upsertAssignment).not.toHaveBeenCalled()
  })

  test('does not throw an error if the minimum number of session is 0', async () => {
    const data = {
      classId: 'classId',
      numberOfSessions: 0,
    }

    mockedAssignmentRepo.upsertAssignment.mockResolvedValue({
      id: 'assignment-id',
      classId: 'classId',
      isRequired: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCreated: true,
    })

    mockedTeacherRepo.getStudentIdsInTeacherClass.mockResolvedValue([
      'student-id-1',
    ])

    await expect(
      AssignmentsService.createAssignment(
        data as AssignmentsService.CreateAssignmentPayload
      )
    ).resolves.not.toThrow('Number of sessions must be greater than 0.')

    expect(mockedAssignmentRepo.upsertAssignment).toHaveBeenCalled()
  })

  test('does not throw an error if the minimum number of session is greater than 0', async () => {
    const data = {
      numberOfSessions: 1,
    }

    mockedAssignmentRepo.upsertAssignment.mockResolvedValue({
      id: 'assignment-id',
      classId: 'classId',
      isRequired: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCreated: true,
      ...data,
    })

    mockedTeacherRepo.getStudentIdsInTeacherClass.mockResolvedValue([
      'student-id-1',
    ])

    await expect(
      AssignmentsService.createAssignment(
        data as AssignmentsService.CreateAssignmentPayload
      )
    ).resolves.not.toThrow('Number of sessions must be greater than 0.')

    data.numberOfSessions = 100
    await expect(
      AssignmentsService.createAssignment(
        data as AssignmentsService.CreateAssignmentPayload
      )
    ).resolves.not.toThrow('Number of sessions must be greater than 0.')

    data.numberOfSessions = 679834
    await expect(
      AssignmentsService.createAssignment(
        data as AssignmentsService.CreateAssignmentPayload
      )
    ).resolves.not.toThrow('Number of sessions must be greater than 0.')

    expect(mockedAssignmentRepo.upsertAssignment).toHaveBeenCalled()
  })

  test('throws an error if the start date is after the due date', async () => {
    let dueDate = moment('2025-05-06')
    let startDate = moment('2025-05-07')
    const data = {
      dueDate: dueDate.toDate(),
      startDate: startDate.toDate(),
    }

    mockedTeacherRepo.getStudentIdsInTeacherClass.mockResolvedValue([
      'student-id-1',
    ])

    await expect(
      AssignmentsService.createAssignment(
        data as AssignmentsService.CreateAssignmentPayload
      )
    ).rejects.toThrow('Start date cannot be after the due date.')

    dueDate = moment()
    startDate = dueDate.clone().add('1', 'second')
    data.dueDate = dueDate.toDate()
    data.startDate = startDate.toDate()
    await expect(
      AssignmentsService.createAssignment(
        data as AssignmentsService.CreateAssignmentPayload
      )
    ).rejects.toThrow('Start date cannot be after the due date.')

    expect(mockedAssignmentRepo.upsertAssignment).not.toHaveBeenCalled()
  })

  test('does not throw an error if the start date is before the due date', async () => {
    let dueDate = moment('2019-08-08')
    let startDate = moment('2019-08-07')
    const data = {
      dueDate: dueDate.toDate(),
      startDate: startDate.toDate(),
    }

    mockedAssignmentRepo.upsertAssignment.mockResolvedValue({
      id: 'assignment-id',
      classId: 'classId',
      isRequired: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCreated: true,
      ...data,
    })

    mockedTeacherRepo.getStudentIdsInTeacherClass.mockResolvedValue([
      'student-id-1',
    ])

    await AssignmentsService.createAssignment(
      data as AssignmentsService.CreateAssignmentPayload
    )

    dueDate = moment()
    startDate = dueDate.clone().subtract('1', 'second')
    data.dueDate = dueDate.toDate()
    data.startDate = startDate.toDate()
    await AssignmentsService.createAssignment(
      data as AssignmentsService.CreateAssignmentPayload
    )

    expect(mockedAssignmentRepo.upsertAssignment).toHaveBeenCalledTimes(2)
  })

  test('creates assignment with `isRequired` as false as default', async () => {
    const data = {
      classId: 'class-id123',
    }

    mockedAssignmentRepo.upsertAssignment.mockResolvedValue({
      id: 'assignment-id',
      isRequired: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCreated: true,
      ...data,
    })

    mockedTeacherRepo.getStudentIdsInTeacherClass.mockResolvedValue([
      'student-id-1',
    ])

    await AssignmentsService.createAssignment(
      data as AssignmentsService.CreateAssignmentPayload
    )

    expect(mockedAssignmentRepo.upsertAssignment).toHaveBeenCalledWith(
      {
        classId: data.classId,
        isRequired: false,
      },
      expect.toBeTransactionClient()
    )
  })

  test('creates the assignment with correct parameters', async () => {
    const data = {
      ...buildAssignment({
        classId: 'class-id123',
        description: 'some description of the assignment',
        dueDate: moment('2025-09-18').toDate(),
        isRequired: true,
        minDurationInMinutes: 30,
        numberOfSessions: 2,
        startDate: moment('2024-01-01').toDate(),
        subjectId: 15,
        title: 'the title of the assignment',
      }),
      isCreated: true,
    }
    mockedAssignmentRepo.upsertAssignment.mockResolvedValue(data)

    mockedTeacherRepo.getStudentIdsInTeacherClass.mockResolvedValue([
      'student-id-1',
    ])

    const { assignment } = await AssignmentsService.createAssignment({
      ...data,
      studentIds: [],
    })

    expect(mockedAssignmentRepo.upsertAssignment).toHaveBeenCalledWith(
      {
        classId: data.classId,
        description: data.description,
        dueDate: data.dueDate,
        isRequired: data.isRequired,
        minDurationInMinutes: data.minDurationInMinutes,
        numberOfSessions: data.numberOfSessions,
        startDate: data.startDate,
        subjectId: data.subjectId,
        title: data.title,
      },
      expect.toBeTransactionClient()
    )
    expect(assignment).toEqual(data)
  })

  test('returns the moderation infractions without creating the assignment when moderation fails', async () => {
    mockedModerationService.moderateAssignmentInfo.mockResolvedValue([
      'VIOLENCE',
      'PROFANITY',
    ])

    const actual = await AssignmentsService.createAssignment({
      classId: 'class-id123',
      description: 'a description',
      isRequired: false,
      studentIds: ['student-id-1'],
      title: 'a BAD title',
    })

    expect(actual).toEqual({
      moderationInfractions: ['VIOLENCE', 'PROFANITY'],
    })
    expect(mockedModerationService.moderateAssignmentInfo).toHaveBeenCalledWith(
      'a BAD title a description'
    )
    expect(mockedAssignmentRepo.upsertAssignment).not.toHaveBeenCalled()
    expect(
      mockedAssignmentRepo.createStudentsAssignmentsForAll
    ).not.toHaveBeenCalled()
  })

  test('assigns the assignment to the selected students', async () => {
    const assignment = buildAssignment()
    mockedAssignmentRepo.upsertAssignment.mockResolvedValue({
      ...assignment,
      isCreated: true,
    })

    await AssignmentsService.createAssignment({
      classId: assignment.classId,
      isRequired: false,
      studentIds: ['student-id-1', 'student-id-2'],
    })

    expect(
      mockedAssignmentRepo.createStudentsAssignmentsForAll
    ).toHaveBeenCalledWith(
      ['student-id-1', 'student-id-2'],
      [assignment.id],
      expect.toBeTransactionClient()
    )
  })

  describe('haveSessionsMetAssignmentRequirements', () => {
    test('returns true if the sessions have met the assignment requirements', async () => {
      let assignment = {
        minDurationInMinutes: 15,
        numberOfSessions: 1,
      }
      let sessions = [
        {
          volunteerJoinedAt: moment('2024-09-23 12:00:000').toDate(),
          endedAt: moment('2024-09-23 12:15:000').toDate(),
        },
      ]
      expect(
        AssignmentsService.haveSessionsMetAssignmentRequirements(
          assignment as StudentAssignment,
          sessions
        )
      ).toBe(true)

      assignment = {
        minDurationInMinutes: 20,
        numberOfSessions: 2,
      }
      sessions = [
        // Not meeting requirement:
        {
          volunteerJoinedAt: moment('2024-09-22 1:00:000').toDate(),
          endedAt: moment('2024-09-22 1:19:999').toDate(),
        },
        // Meeting requirement:
        {
          volunteerJoinedAt: moment('2024-09-18 15:10:000').toDate(),
          endedAt: moment('2024-09-18 16:01:000').toDate(),
        },
        {
          volunteerJoinedAt: moment('2024-09-14 19:01:000').toDate(),
          endedAt: moment('2024-09-14 19:21:000').toDate(),
        },
      ]
      expect(
        AssignmentsService.haveSessionsMetAssignmentRequirements(
          assignment as StudentAssignment,
          sessions
        )
      ).toBe(true)

      assignment = {
        minDurationInMinutes: 30,
        numberOfSessions: 3,
      }
      sessions = [
        // Not meeting requirement:
        {
          // @ts-ignore
          volunteerJoinedAt: undefined,
          endedAt: moment('2024-09-14 19:21:000').toDate(),
        },
        {
          volunteerJoinedAt: moment('2024-09-20 1:00:000').toDate(),
          endedAt: moment('2024-09-20 1:19:999').toDate(),
        },
        // Meeting requirement:
        {
          volunteerJoinedAt: moment('2024-09-18 15:10:000').toDate(),
          endedAt: moment('2024-09-18 16:24:000').toDate(),
        },
        {
          volunteerJoinedAt: moment('2024-09-13 19:03:000').toDate(),
          endedAt: moment('2024-09-13 20:21:000').toDate(),
        },
        {
          volunteerJoinedAt: moment('2024-09-14 19:01:000').toDate(),
          endedAt: moment('2024-09-14 19:51:000').toDate(),
        },
      ]
      expect(
        AssignmentsService.haveSessionsMetAssignmentRequirements(
          assignment as StudentAssignment,
          sessions
        )
      ).toBe(true)
    })

    test('returns true if the session is at least of minimum duration', async () => {
      const assignment = {
        minDurationInMinutes: 20,
        numberOfSessions: 1,
      }
      const sessions = [
        {
          volunteerJoinedAt: moment('2023-08-01 12:00:000').toDate(),
          endedAt: moment('2023-08-01 12:20:000').toDate(),
        },
      ]
      expect(
        AssignmentsService.haveSessionsMetAssignmentRequirements(
          assignment as StudentAssignment,
          sessions
        )
      ).toBe(true)
    })

    test('returns false if the session is not of at least minimum duration', async () => {
      const assignment = {
        minDurationInMinutes: 20,
        numberOfSessions: 1,
      }
      const sessions = [
        {
          volunteerJoinedAt: moment('2023-08-01 12:00:000').toDate(),
          endedAt: moment('2023-08-01 12:19:999').toDate(),
        },
      ]
      expect(
        AssignmentsService.haveSessionsMetAssignmentRequirements(
          assignment as StudentAssignment,
          sessions
        )
      ).toBe(false)
    })

    test('returns false if the volunteer never joined the session', async () => {
      const assignment = {
        minDurationInMinutes: 1,
        numberOfSessions: 1,
      }
      const sessions = [
        {
          volunteerJoinedAt: undefined,
          endedAt: moment().toDate(),
        },
      ]
      expect(
        AssignmentsService.haveSessionsMetAssignmentRequirements(
          assignment as StudentAssignment,
          sessions
        )
      ).toBe(false)
    })

    test('returns false if the volunteer never joined the session', async () => {
      const assignment = {
        minDurationInMinutes: 1,
        numberOfSessions: 1,
      }
      const sessions = [
        {
          volunteerJoinedAt: undefined,
          endedAt: moment().toDate(),
        },
      ]
      expect(
        AssignmentsService.haveSessionsMetAssignmentRequirements(
          assignment as StudentAssignment,
          sessions
        )
      ).toBe(false)
    })

    test('returns false if the sessions have not met the assignment requirements', async () => {
      let assignment = {
        minDurationInMinutes: 15,
        numberOfSessions: 1,
      }
      let sessions = [
        {
          volunteerJoinedAt: moment('2024-09-23 12:00:000').toDate(),
          endedAt: moment('2024-09-23 12:14:999').toDate(),
        },
      ]
      expect(
        AssignmentsService.haveSessionsMetAssignmentRequirements(
          assignment as StudentAssignment,
          sessions
        )
      ).toBe(false)

      assignment = {
        minDurationInMinutes: 20,
        numberOfSessions: 2,
      }
      sessions = []
      expect(
        AssignmentsService.haveSessionsMetAssignmentRequirements(
          assignment as StudentAssignment,
          sessions
        )
      ).toBe(false)
    })
  })
})

describe('createAssignmentForClasses', () => {
  beforeEach(() => {
    mockedModerationService.moderateAssignmentInfo.mockResolvedValue([])
  })

  test('creates an assignment for every class with the correct parameters', async () => {
    const data = {
      ...buildAssignment(),
      classIds: ['a', 'b', 'c'],
    }
    mockedAssignmentRepo.upsertAssignment.mockImplementation(async (input) => ({
      id: `assignment-for-${input.classId}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCreated: true,
      ...input,
    }))

    const { assignments } = await AssignmentsService.createAssignmentForClasses(
      data,
      data.classIds
    )

    expect(mockedAssignmentRepo.upsertAssignment).toHaveBeenCalledTimes(
      data.classIds.length
    )
    for (const classId of data.classIds) {
      expect(mockedAssignmentRepo.upsertAssignment).toHaveBeenCalledWith(
        {
          classId,
          description: data.description,
          dueDate: data.dueDate,
          isRequired: data.isRequired,
          minDurationInMinutes: data.minDurationInMinutes,
          numberOfSessions: data.numberOfSessions,
          startDate: data.startDate,
          subjectId: data.subjectId,
          title: data.title,
        },
        expect.toBeTransactionClient()
      )
    }

    expect(assignments?.length).toBe(data.classIds.length)
  })

  test('assigns the new assignment to every student in the classes', async () => {
    const data = {
      ...buildAssignment(),
      classIds: ['class-1', 'class-2'],
    }

    mockedAssignmentRepo.upsertAssignment
      .mockResolvedValueOnce({
        ...data,
        id: 'assignment-1',
        classId: 'class-1',
        isCreated: true,
      })
      .mockResolvedValueOnce({
        ...data,
        id: 'assignment-2',
        classId: 'class-2',
        isCreated: true,
      })
    mockedTeacherRepo.getStudentIdsInTeacherClass
      .mockResolvedValueOnce(['student-1', 'student-2'])
      .mockResolvedValueOnce(['student-3'])

    await AssignmentsService.createAssignmentForClasses(data, data.classIds)

    expect(mockedTeacherRepo.getStudentIdsInTeacherClass).toHaveBeenCalledWith(
      expect.toBeTransactionClient(),
      'class-1'
    )
    expect(mockedTeacherRepo.getStudentIdsInTeacherClass).toHaveBeenCalledWith(
      expect.toBeTransactionClient(),
      'class-2'
    )
    expect(
      mockedAssignmentRepo.createStudentsAssignmentsForAll
    ).toHaveBeenCalledWith(
      ['student-1', 'student-2'],
      ['assignment-1'],
      expect.toBeTransactionClient()
    )
    expect(
      mockedAssignmentRepo.createStudentsAssignmentsForAll
    ).toHaveBeenCalledWith(
      ['student-3'],
      ['assignment-2'],
      expect.toBeTransactionClient()
    )
  })

  test('returns the moderation infractions without creating any assignments when moderation fails', async () => {
    mockedModerationService.moderateAssignmentInfo.mockResolvedValue([
      'VIOLENCE',
    ])
    const data = {
      ...buildAssignment(),
      classIds: ['meow', 'woof'],
    }

    const actual = await AssignmentsService.createAssignmentForClasses(
      data,
      data.classIds
    )

    expect(actual).toEqual({ moderationInfractions: ['VIOLENCE'] })
    expect(mockedModerationService.moderateAssignmentInfo).toHaveBeenCalledWith(
      `${data.title} ${data.description}`
    )
    expect(mockedAssignmentRepo.upsertAssignment).not.toHaveBeenCalled()
    expect(
      mockedAssignmentRepo.createStudentsAssignmentsForAll
    ).not.toHaveBeenCalled()
  })
})

describe('addStudentToClassAssignments', () => {
  test('adds the student to all the assignments that are assigned to the entire class', async () => {
    const tc = {} as TransactionClient
    mockedTeacherClassRepo.getTotalStudentsInClass.mockResolvedValue(3)
    mockedAssignmentRepo.getAssignmentsByClassId.mockResolvedValue([
      { id: 'assignedToNoOne' } as Assignment,
      { id: 'assignedToAll' } as Assignment,
    ])
    mockedAssignmentRepo.getStudentAssignmentCompletion
      .mockResolvedValueOnce([]) // Called for 'assignedToNoOne'
      .mockResolvedValueOnce([
        // Called for 'assignedToAll'
        { firstName: '1', lastName: '1', submittedAt: null },
        { firstName: '2', lastName: '2', submittedAt: moment().toDate() },
        { firstName: '3', lastName: '3', submittedAt: null },
      ])

    await AssignmentsService.addStudentsToClassAssignments(
      ['studentId'],
      'classId',
      tc
    )

    expect(
      mockedAssignmentRepo.createStudentsAssignmentsForAll
    ).toHaveBeenCalledWith(['studentId'], ['assignedToAll'], tc)
  })

  test('does not throw an error if no assignments for the class to add', async () => {
    const tc = {} as TransactionClient
    mockedTeacherClassRepo.getTotalStudentsInClass.mockResolvedValue(2)
    mockedAssignmentRepo.getAssignmentsByClassId.mockResolvedValue([])
    mockedAssignmentRepo.getStudentAssignmentCompletion.mockResolvedValue([])

    await AssignmentsService.addStudentsToClassAssignments(
      ['studentId'],
      'classId',
      tc
    )

    expect(
      mockedAssignmentRepo.createStudentsAssignmentsForAll
    ).not.toHaveBeenCalledWith()
  })
})

describe('uploadAssignmentFiles', () => {
  const assignmentId = '123'
  const files = [buildFile('file1', 'jpeg'), buildFile('file2', 'png')]

  beforeEach(() => {
    mockedImageUtils.isImageFile.mockReturnValue(true)
  })

  it('Does not upload any files if there is a moderation infraction', async () => {
    mockedModerationService.moderateImage.mockResolvedValueOnce({
      isClean: false,
      failures: ['VIOLENCE'],
    })
    mockedModerationService.moderateImage.mockResolvedValueOnce({
      isClean: true,
      failures: [],
    })
    const actual = await AssignmentsService.uploadAssignmentFiles(
      assignmentId,
      files,
      'teacher-user-id'
    )
    expect(actual).toEqual({
      file1: ['VIOLENCE'],
    })
    expect(mockedModerationService.moderateImage).toHaveBeenCalledTimes(
      files.length
    )
    expect(mockedAzureService.uploadBlobFile).not.toHaveBeenCalled()
  })

  it('Uploads files if moderation comes back clean', async () => {
    mockedModerationService.moderateImage.mockResolvedValue({
      isClean: true,
      failures: [],
    })
    const actual = await AssignmentsService.uploadAssignmentFiles(
      assignmentId,
      files,
      'teacher-user-id'
    )
    expect(actual).toEqual({})
    expect(mockedModerationService.moderateImage).toHaveBeenCalledTimes(
      files.length
    )
    expect(mockedAzureService.uploadBlobFile).toHaveBeenCalledTimes(
      files.length
    )
  })
})

function buildFile(nameWithoutExtension: string, extension: string) {
  return {
    originalname: nameWithoutExtension,
    buffer: {
      name: nameWithoutExtension,
      ext: extension,
    },
  }
}
