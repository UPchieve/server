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
import * as PhotoDnaService from '../../services/PhotoDnaService'
import * as FeatureFlagService from '../../services/FeatureFlagService'
import * as ImageUtils from '../../utils/image-utils'
import { buildAssignment, buildTeacherClass } from '../mocks/generate'

jest.mock('../../models/Assignments')
jest.mock('../../models/Teacher')
jest.mock('../../models/TeacherClass')
jest.mock('../../services/ModerationService')
jest.mock('../../services/AzureService')
jest.mock('../../services/PhotoDnaService')
jest.mock('../../services/FeatureFlagService')
jest.mock('../../utils/image-utils')
const mockedAssignmentRepo = mocked(AssignmentRepo)
const mockedTeacherRepo = mocked(TeacherRepo)
const mockedTeacherClassRepo = mocked(TeacherClassRepo)
const mockedModerationService = mocked(ModerationService)
const mockedAzureService = mocked(AzureService)
const mockedPhotoDnaService = mocked(PhotoDnaService)
const mockedFeatureFlagService = mocked(FeatureFlagService)
const mockedImageUtils = mocked(ImageUtils)

function buildFile(
  nameWithoutExtension: string,
  extension: string
): Express.Multer.File {
  return {
    originalname: nameWithoutExtension,
    buffer: {
      name: nameWithoutExtension,
      ext: extension,
    },
  } as unknown as Express.Multer.File
}

beforeEach(() => {
  jest.resetAllMocks()
  mockedFeatureFlagService.getPhotoDnaMatchCheckFlag.mockResolvedValue(true)
})

describe('upsertAssignment', () => {
  beforeEach(() => {
    mockedModerationService.moderateAssignmentInfo.mockResolvedValue([])
    mockedTeacherRepo.getTeacherClassById.mockImplementation(
      async (classId) => ({
        ...buildTeacherClass({ id: classId, userId: 'teacher-id' }),
        cleverId: undefined,
        topicId: 1,
        totalStudents: 1,
      })
    )
  })

  test('throws an error if the minimum number of sessions is less than 0', async () => {
    const data = {
      numberOfSessions: -1,
    }
    await expect(
      AssignmentsService.upsertAssignment(
        'teacher-id',
        data as AssignmentsService.UpsertAssignmentPayload
      )
    ).rejects.toThrow('Number of sessions must be greater than 0.')

    data.numberOfSessions = -5
    await expect(
      AssignmentsService.upsertAssignment(
        'teacher-id',
        data as AssignmentsService.UpsertAssignmentPayload
      )
    ).rejects.toThrow('Number of sessions must be greater than 0.')

    data.numberOfSessions = -5690
    await expect(
      AssignmentsService.upsertAssignment(
        'teacher-id',
        data as AssignmentsService.UpsertAssignmentPayload
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
      AssignmentsService.upsertAssignment(
        'teacher-id',
        data as AssignmentsService.UpsertAssignmentPayload
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
      AssignmentsService.upsertAssignment(
        'teacher-id',
        data as AssignmentsService.UpsertAssignmentPayload
      )
    ).resolves.not.toThrow('Number of sessions must be greater than 0.')

    data.numberOfSessions = 100
    await expect(
      AssignmentsService.upsertAssignment(
        'teacher-id',
        data as AssignmentsService.UpsertAssignmentPayload
      )
    ).resolves.not.toThrow('Number of sessions must be greater than 0.')

    data.numberOfSessions = 679834
    await expect(
      AssignmentsService.upsertAssignment(
        'teacher-id',
        data as AssignmentsService.UpsertAssignmentPayload
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
      AssignmentsService.upsertAssignment(
        'teacher-id',
        data as AssignmentsService.UpsertAssignmentPayload
      )
    ).rejects.toThrow('Start date cannot be after the due date.')

    dueDate = moment()
    startDate = dueDate.clone().add('1', 'second')
    data.dueDate = dueDate.toDate()
    data.startDate = startDate.toDate()
    await expect(
      AssignmentsService.upsertAssignment(
        'teacher-id',
        data as AssignmentsService.UpsertAssignmentPayload
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

    await AssignmentsService.upsertAssignment(
      'teacher-id',
      data as AssignmentsService.UpsertAssignmentPayload
    )

    dueDate = moment()
    startDate = dueDate.clone().subtract('1', 'second')
    data.dueDate = dueDate.toDate()
    data.startDate = startDate.toDate()
    await AssignmentsService.upsertAssignment(
      'teacher-id',
      data as AssignmentsService.UpsertAssignmentPayload
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

    await AssignmentsService.upsertAssignment(
      'teacher-id',
      data as AssignmentsService.UpsertAssignmentPayload
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
    mockedAssignmentRepo.getAssignmentById.mockResolvedValue({
      teacherId: 'teacher-id',
      classId: data.classId,
    } as any)

    mockedTeacherRepo.getStudentIdsInTeacherClass.mockResolvedValue([
      'student-id-1',
    ])

    const { assignment } = await AssignmentsService.upsertAssignment(
      'teacher-id',
      data
    )

    expect(mockedAssignmentRepo.upsertAssignment).toHaveBeenCalledWith(
      {
        id: data.id,
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
    expect(mockedTeacherRepo.getTeacherClassById).toHaveBeenCalledWith(
      data.classId
    )
    expect(mockedAssignmentRepo.getAssignmentById).toHaveBeenCalledWith(data.id)
    expect(assignment).toEqual(data)
  })

  test('returns the moderation infractions without creating the assignment when moderation fails', async () => {
    mockedModerationService.moderateAssignmentInfo.mockResolvedValue([
      'VIOLENCE',
      'PROFANITY',
    ])

    const actual = await AssignmentsService.upsertAssignment('teacher-id', {
      classId: 'class-id123',
      description: 'a description',
      isRequired: false,
      studentsToAdd: ['student-id-1'],
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
    const data = buildAssignment()
    mockedAssignmentRepo.upsertAssignment.mockResolvedValue({
      ...data,
      isCreated: true,
    })

    await AssignmentsService.upsertAssignment('teacher-id', {
      classId: data.classId,
      isRequired: false,
      studentsToAdd: ['student-id-1', 'student-id-2'],
    })

    expect(
      mockedAssignmentRepo.createStudentsAssignmentsForAll
    ).toHaveBeenCalledWith(
      ['student-id-1', 'student-id-2'],
      [data.id],
      expect.toBeTransactionClient()
    )
  })

  describe('with uploaded files', () => {
    const files = [buildFile('file1', 'jpeg'), buildFile('file2', 'png')]
    const data = {
      classId: 'class-id',
      isRequired: false,
    } as AssignmentsService.UpsertAssignmentPayload

    beforeEach(() => {
      mockedImageUtils.isImageFile.mockReturnValue(true)
      mockedAssignmentRepo.upsertAssignment.mockResolvedValue({
        ...buildAssignment({ id: 'assignment-id', classId: data.classId }),
        isCreated: true,
      })
    })

    test('moderates and uploads the files for the saved assignment', async () => {
      mockedModerationService.moderateImage.mockResolvedValue({
        isClean: true,
        failures: [],
      })

      const { assignment, imageModerationInfractions } =
        await AssignmentsService.upsertAssignment('teacher-id', data, files)

      expect(imageModerationInfractions).toBeUndefined()
      expect(assignment?.id).toBe('assignment-id')
      expect(mockedModerationService.moderateImage).toHaveBeenCalledTimes(
        files.length
      )
      expect(mockedModerationService.moderateImage).toHaveBeenCalledWith(
        files[0].buffer,
        {
          source: 'assignment_image',
          assignmentId: 'assignment-id',
          userId: 'teacher-id',
        }
      )
      expect(
        mockedAzureService.uploadBlobFile.mock.calls.map((call) => call[2])
      ).toEqual(['assignment-id/file1', 'assignment-id/file2'])
    })

    test('returns the image moderation infractions without uploading any files when a file is flagged', async () => {
      mockedModerationService.moderateImage
        .mockResolvedValueOnce({ isClean: false, failures: ['Violence'] })
        .mockResolvedValueOnce({ isClean: true, failures: [] })

      const actual = await AssignmentsService.upsertAssignment(
        'teacher-id',
        data,
        files
      )

      expect(actual.imageModerationInfractions).toEqual({
        file1: ['Violence'],
      })
      // The assignment was already saved, so it is returned for the client to
      // retry against instead of creating a duplicate.
      expect(actual.assignment?.id).toBe('assignment-id')
      expect(mockedAzureService.uploadBlobFile).not.toHaveBeenCalled()
      expect(mockedAssignmentRepo.upsertAssignment).toHaveBeenCalled()
    })

    test('checks the files with PhotoDNA before moderating or saving anything', async () => {
      mockedPhotoDnaService.checkAgainstPhotoDNA.mockRejectedValueOnce(
        new Error('PhotoDNA match')
      )

      await expect(
        AssignmentsService.upsertAssignment('teacher-id', data, files)
      ).rejects.toThrow('PhotoDNA match')

      expect(mockedPhotoDnaService.checkAgainstPhotoDNA).toHaveBeenCalledWith(
        files[0],
        'teacher-id'
      )
      expect(
        mockedModerationService.moderateAssignmentInfo
      ).not.toHaveBeenCalled()
      expect(mockedModerationService.moderateImage).not.toHaveBeenCalled()
      expect(mockedAssignmentRepo.upsertAssignment).not.toHaveBeenCalled()
      expect(mockedAzureService.uploadBlobFile).not.toHaveBeenCalled()
    })

    test('skips the PhotoDNA check when the feature flag is disabled', async () => {
      mockedFeatureFlagService.getPhotoDnaMatchCheckFlag.mockResolvedValue(
        false
      )
      mockedModerationService.moderateImage.mockResolvedValue({
        isClean: true,
        failures: [],
      })

      await AssignmentsService.upsertAssignment('teacher-id', data, files)

      expect(mockedPhotoDnaService.checkAgainstPhotoDNA).not.toHaveBeenCalled()
      expect(mockedAssignmentRepo.upsertAssignment).toHaveBeenCalled()
    })

    test('throws an error without saving the assignment or uploading any files for an unsupported file type', async () => {
      mockedImageUtils.isImageFile.mockReturnValue(false)
      mockedImageUtils.isPdf.mockReturnValue(false)

      await expect(
        AssignmentsService.upsertAssignment('teacher-id', data, files)
      ).rejects.toThrow('Unsupported file type')

      expect(mockedModerationService.moderateImage).not.toHaveBeenCalled()
      expect(mockedAzureService.uploadBlobFile).not.toHaveBeenCalled()
      // File types are checked up front, so nothing is written and the client
      // can retry without leaving an orphaned assignment behind.
      expect(mockedAssignmentRepo.upsertAssignment).not.toHaveBeenCalled()
    })

    test('does not moderate or upload anything when no files are given', async () => {
      await AssignmentsService.upsertAssignment('teacher-id', data)

      expect(mockedModerationService.moderateImage).not.toHaveBeenCalled()
      expect(mockedAzureService.uploadBlobFile).not.toHaveBeenCalled()
    })
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
    mockedTeacherRepo.getTeacherClassById.mockImplementation(
      async (classId) => ({
        ...buildTeacherClass({ id: classId, userId: 'teacher-id' }),
        cleverId: undefined,
        topicId: 1,
        totalStudents: 1,
      })
    )
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
      'teacher-id',
      data,
      data.classIds
    )

    expect(mockedAssignmentRepo.upsertAssignment).toHaveBeenCalledTimes(
      data.classIds.length
    )
    for (const classId of data.classIds) {
      expect(mockedAssignmentRepo.upsertAssignment).toHaveBeenCalledWith(
        {
          id: expect.any(String),
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

    await AssignmentsService.createAssignmentForClasses(
      'teacher-id',
      data,
      data.classIds
    )

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
      'teacher-id',
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

  test('does nothing when there are no classes', async () => {
    const actual = await AssignmentsService.createAssignmentForClasses(
      'teacher-id',
      buildAssignment(),
      []
    )

    expect(actual).toEqual({ assignments: [] })
    expect(
      mockedModerationService.moderateAssignmentInfo
    ).not.toHaveBeenCalled()
    expect(mockedAssignmentRepo.upsertAssignment).not.toHaveBeenCalled()
  })

  test('creates no assignments if any of the classes belongs to another teacher', async () => {
    const data = {
      ...buildAssignment(),
      classIds: ['my-class', 'not-my-class'],
    }
    mockedTeacherRepo.getTeacherClassById.mockImplementation(
      async (classId) => ({
        ...buildTeacherClass({
          id: classId,
          userId:
            classId === 'not-my-class' ? 'another-teacher-id' : 'teacher-id',
        }),
        cleverId: undefined,
        topicId: 1,
        totalStudents: 1,
      })
    )

    await expect(
      AssignmentsService.createAssignmentForClasses(
        'teacher-id',
        data,
        data.classIds,
        [buildFile('file1', 'jpeg')]
      )
    ).rejects.toThrow(
      'Teacher unable to edit assignment in class that is not theirs'
    )

    expect(mockedAssignmentRepo.upsertAssignment).not.toHaveBeenCalled()
    expect(mockedAzureService.uploadBlobFile).not.toHaveBeenCalled()
  })

  describe('with uploaded files', () => {
    const files = [buildFile('file1', 'jpeg'), buildFile('file2', 'png')]
    const data = {
      ...buildAssignment(),
      classIds: ['class-1', 'class-2'],
    }

    beforeEach(() => {
      mockedImageUtils.isImageFile.mockReturnValue(true)
      mockedAssignmentRepo.upsertAssignment.mockImplementation(
        async (input) => ({
          createdAt: new Date(),
          updatedAt: new Date(),
          isCreated: true,
          ...input,
          id: input.id!,
        })
      )
    })

    test('uploads the files for every assignment before creating them', async () => {
      mockedModerationService.moderateImage.mockResolvedValue({
        isClean: true,
        failures: [],
      })

      const { assignments, imageModerationInfractions } =
        await AssignmentsService.createAssignmentForClasses(
          'teacher-id',
          data,
          data.classIds,
          files
        )

      expect(imageModerationInfractions).toBeUndefined()
      expect(mockedModerationService.moderateImage).toHaveBeenCalledTimes(
        files.length
      )
      expect(mockedModerationService.moderateImage).toHaveBeenCalledWith(
        files[0].buffer,
        {
          source: 'assignment_image',
          assignmentId: 'not-yet-created-assignment',
          userId: 'teacher-id',
        }
      )
      const assignmentIds = assignments?.map((assignment) => assignment.id)
      const BLOBNAME_ARG_INDEX = 2
      expect(
        mockedAzureService.uploadBlobFile.mock.calls
          .map((call) => call[BLOBNAME_ARG_INDEX])
          .sort()
      ).toEqual(
        assignmentIds
          ?.flatMap((id) => files.map((file) => `${id}/${file.originalname}`))
          .sort()
      )
      expect(
        mockedAzureService.uploadBlobFile.mock.invocationCallOrder[0]
      ).toBeLessThan(
        mockedAssignmentRepo.upsertAssignment.mock.invocationCallOrder[0]
      )
    })

    test('returns the image moderation infractions without creating any assignments when a file is flagged', async () => {
      mockedModerationService.moderateImage
        .mockResolvedValueOnce({ isClean: false, failures: ['Violence'] })
        .mockResolvedValueOnce({ isClean: true, failures: [] })

      const actual = await AssignmentsService.createAssignmentForClasses(
        'teacher-id',
        data,
        data.classIds,
        files
      )

      expect(actual).toEqual({
        imageModerationInfractions: { file1: ['Violence'] },
      })
      expect(mockedAzureService.uploadBlobFile).not.toHaveBeenCalled()
      expect(mockedAssignmentRepo.upsertAssignment).not.toHaveBeenCalled()
    })

    test('checks the files with PhotoDNA before moderating or creating any assignments', async () => {
      mockedPhotoDnaService.checkAgainstPhotoDNA.mockRejectedValueOnce(
        new Error('PhotoDNA match')
      )

      await expect(
        AssignmentsService.createAssignmentForClasses(
          'teacher-id',
          data,
          data.classIds,
          files
        )
      ).rejects.toThrow('PhotoDNA match')

      expect(mockedPhotoDnaService.checkAgainstPhotoDNA).toHaveBeenCalledWith(
        files[0],
        'teacher-id'
      )
      expect(
        mockedModerationService.moderateAssignmentInfo
      ).not.toHaveBeenCalled()
      expect(mockedModerationService.moderateImage).not.toHaveBeenCalled()
      expect(mockedAssignmentRepo.upsertAssignment).not.toHaveBeenCalled()
      expect(mockedAzureService.uploadBlobFile).not.toHaveBeenCalled()
    })

    test('throws an error without creating any assignments for an unsupported file type', async () => {
      mockedImageUtils.isImageFile.mockReturnValue(false)
      mockedImageUtils.isPdf.mockReturnValue(false)

      await expect(
        AssignmentsService.createAssignmentForClasses(
          'teacher-id',
          data,
          data.classIds,
          files
        )
      ).rejects.toThrow('Unsupported file type')

      expect(mockedModerationService.moderateImage).not.toHaveBeenCalled()
      expect(mockedAzureService.uploadBlobFile).not.toHaveBeenCalled()
      expect(mockedAssignmentRepo.upsertAssignment).not.toHaveBeenCalled()
    })

    test('does not moderate or upload anything when no files are given', async () => {
      await AssignmentsService.createAssignmentForClasses(
        'teacher-id',
        data,
        data.classIds
      )

      expect(mockedModerationService.moderateImage).not.toHaveBeenCalled()
      expect(mockedAzureService.uploadBlobFile).not.toHaveBeenCalled()
      expect(mockedAssignmentRepo.upsertAssignment).toHaveBeenCalledTimes(
        data.classIds.length
      )
    })
  })
})

describe('ensureAuthorizedToUpsertAssignment', () => {
  beforeEach(() => {
    mockedTeacherRepo.getTeacherClassById.mockResolvedValue({
      id: 'class-id',
      userId: 'teacher-id',
    } as any)
    mockedAssignmentRepo.getAssignmentById.mockResolvedValue({
      id: 'assignment-id',
      classId: 'class-id',
      teacherId: 'teacher-id',
    } as any)
  })

  test('does not throw if the teacher owns the class and the assignment', async () => {
    await AssignmentsService.ensureAuthorizedToUpsertAssignment(
      'teacher-id',
      'class-id',
      'assignment-id'
    )

    expect(mockedTeacherRepo.getTeacherClassById).toHaveBeenCalledWith(
      'class-id'
    )
    expect(mockedAssignmentRepo.getAssignmentById).toHaveBeenCalledWith(
      'assignment-id'
    )
  })

  test('does not look up the assignment if no assignment id is given', async () => {
    await AssignmentsService.ensureAuthorizedToUpsertAssignment(
      'teacher-id',
      'class-id'
    )

    expect(mockedAssignmentRepo.getAssignmentById).not.toHaveBeenCalled()
  })

  test('throws an error if the class belongs to another teacher', async () => {
    mockedTeacherRepo.getTeacherClassById.mockResolvedValue({
      id: 'class-id',
      userId: 'another-teacher-id',
    } as any)

    await expect(
      AssignmentsService.ensureAuthorizedToUpsertAssignment(
        'teacher-id',
        'class-id'
      )
    ).rejects.toThrow(
      'Teacher unable to edit assignment in class that is not theirs'
    )

    expect(mockedAssignmentRepo.getAssignmentById).not.toHaveBeenCalled()
  })

  test('throws an error if the class does not exist', async () => {
    mockedTeacherRepo.getTeacherClassById.mockResolvedValue(undefined)

    await expect(
      AssignmentsService.ensureAuthorizedToUpsertAssignment(
        'teacher-id',
        'class-id'
      )
    ).rejects.toThrow(
      'Teacher unable to edit assignment in class that is not theirs'
    )
  })

  test('throws an error if the assignment belongs to another teacher', async () => {
    mockedAssignmentRepo.getAssignmentById.mockResolvedValue({
      id: 'assignment-id',
      classId: 'class-id',
      teacherId: 'another-teacher-id',
    } as any)

    await expect(
      AssignmentsService.ensureAuthorizedToUpsertAssignment(
        'teacher-id',
        'class-id',
        'assignment-id'
      )
    ).rejects.toThrow('Teacher unable to edit assignment that is not theirs')
  })

  test('throws an error if the assignment belongs to another class', async () => {
    mockedAssignmentRepo.getAssignmentById.mockResolvedValue({
      id: 'assignment-id',
      classId: 'another-class-id',
      teacherId: 'teacher-id',
    } as any)

    await expect(
      AssignmentsService.ensureAuthorizedToUpsertAssignment(
        'teacher-id',
        'class-id',
        'assignment-id'
      )
    ).rejects.toThrow('Teacher unable to edit assignment that is not theirs')
  })

  test('throws an error if the assignment does not exist', async () => {
    mockedAssignmentRepo.getAssignmentById.mockResolvedValue(undefined)

    await expect(
      AssignmentsService.ensureAuthorizedToUpsertAssignment(
        'teacher-id',
        'class-id',
        'assignment-id'
      )
    ).rejects.toThrow('Teacher unable to edit assignment that is not theirs')
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
