import { mocked } from 'jest-mock'
import * as AssignmentsService from '../../services/AssignmentsService'
import * as AssignmentRepo from '../../models/Assignments'
import * as TeacherRepo from '../../models/Teacher'
import moment from 'moment'
import { StudentAssignment } from '../../models/Assignments'

jest.mock('../../models/Assignments')
jest.mock('../../models/Teacher')
const mockedAssignmentRepo = mocked(AssignmentRepo)
const mockedTeacherRepo = mocked(TeacherRepo)

describe('createAssignment', () => {
  beforeEach(() => {
    jest.resetAllMocks()
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

    expect(mockedAssignmentRepo.createAssignment).not.toHaveBeenCalled()
  })

  test('does not throw an error if the minimum number of session is 0', async () => {
    const data = {
      classId: 'classId',
      numberOfSessions: 0,
    }

    mockedAssignmentRepo.createAssignment.mockResolvedValue({
      id: 'assignment-id',
      classId: 'classId',
      isRequired: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockedTeacherRepo.getStudentIdsInTeacherClass.mockResolvedValue([
      'student-id-1',
    ])

    await expect(
      AssignmentsService.createAssignment(
        data as AssignmentsService.CreateAssignmentPayload
      )
    ).resolves.not.toThrow('Number of sessions must be greater than 0.')

    expect(mockedAssignmentRepo.createAssignment).toHaveBeenCalled()
  })

  test('does not throw an error if the minimum number of session is greater than 0', async () => {
    const data = {
      numberOfSessions: 1,
    }

    mockedAssignmentRepo.createAssignment.mockResolvedValue({
      id: 'assignment-id',
      classId: 'classId',
      isRequired: false,
      createdAt: new Date(),
      updatedAt: new Date(),
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

    expect(mockedAssignmentRepo.createAssignment).toHaveBeenCalled()
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

    expect(mockedAssignmentRepo.createAssignment).not.toHaveBeenCalled()
  })

  test('does not throw an error if the start date is before the due date', async () => {
    let dueDate = moment('2019-08-08')
    let startDate = moment('2019-08-07')
    const data = {
      dueDate: dueDate.toDate(),
      startDate: startDate.toDate(),
    }

    mockedAssignmentRepo.createAssignment.mockResolvedValue({
      id: 'assignment-id',
      classId: 'classId',
      isRequired: false,
      createdAt: new Date(),
      updatedAt: new Date(),
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

    expect(mockedAssignmentRepo.createAssignment).toHaveBeenCalledTimes(2)
  })

  test('creates assignment with `isRequired` as false as default', async () => {
    const data = {
      classId: 'class-id123',
    }

    mockedAssignmentRepo.createAssignment.mockResolvedValue({
      id: 'assignment-id',
      isRequired: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    })

    mockedTeacherRepo.getStudentIdsInTeacherClass.mockResolvedValue([
      'student-id-1',
    ])

    await AssignmentsService.createAssignment(
      data as AssignmentsService.CreateAssignmentPayload
    )

    expect(mockedAssignmentRepo.createAssignment).toHaveBeenCalledWith(
      {
        classId: data.classId,
        isRequired: false,
      },
      expect.toBeTransactionClient()
    )
  })

  test('creates the assignment with correct parameters', async () => {
    const data = {
      classId: 'class-id123',
      description: 'some description of the assignment',
      dueDate: moment('2025-09-18').toDate(),
      isRequired: true,
      minDurationInMinutes: 30,
      numberOfSessions: 2,
      startDate: moment('2024-01-01').toDate(),
      subjectId: 15,
      title: 'the title of the assignment',
    }
    mockedAssignmentRepo.createAssignment.mockResolvedValue({
      id: 'assignment-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    })

    mockedTeacherRepo.getStudentIdsInTeacherClass.mockResolvedValue([
      'student-id-1',
    ])
    await AssignmentsService.createAssignment(
      data as AssignmentsService.CreateAssignmentPayload
    )
    expect(mockedAssignmentRepo.createAssignment).toHaveBeenCalledWith(
      data,
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
