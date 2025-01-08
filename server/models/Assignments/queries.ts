import { getClient, TransactionClient } from '../../db'
import {
  RepoReadError,
  RepoCreateError,
  RepoUpdateError,
  RepoDeleteError,
} from '../Errors'
import {
  Assignment,
  CreateAssignmentInput,
  CreateStudentAssignmentInput,
  CreateStudentAssignmentResult,
  EditAssignmentInput,
} from './types'
import * as pgQueries from './pg.queries'
import {
  Ulid,
  getDbUlid,
  makeSomeOptional,
  makeSomeRequired,
  Uuid,
  makeRequired,
} from '../pgUtils'
import moment from 'moment'

export async function createAssignment(
  data: CreateAssignmentInput,
  tc: TransactionClient = getClient()
): Promise<Assignment> {
  try {
    const assignment = await pgQueries.createAssignment.run(
      {
        id: getDbUlid(),
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
      tc
    )
    if (!assignment.length) {
      throw new RepoCreateError('Unable to create assignment.')
    }
    return makeSomeRequired(assignment[0], [
      'id',
      'classId',
      'isRequired',
      'createdAt',
      'updatedAt',
    ])
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function editAssignment(
  data: EditAssignmentInput,
  tc: TransactionClient = getClient()
): Promise<Assignment> {
  try {
    const assignment = await pgQueries.editAssignmentById.run(
      {
        id: data.id,
        description: data.description,
        dueDate: data.dueDate,
        isRequired: data.isRequired,
        minDurationInMinutes: data.minDurationInMinutes,
        numberOfSessions: data.numberOfSessions,
        startDate: data.startDate,
        subjectId: data.subjectId,
        title: data.title,
      },
      tc
    )
    if (!assignment.length) {
      throw new RepoCreateError('Unable to create assignment.')
    }
    return makeSomeRequired(assignment[0], [
      'id',
      'classId',
      'isRequired',
      'createdAt',
      'updatedAt',
    ])
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getAssignmentsByClassId(
  classId: Ulid,
  tc: TransactionClient = getClient()
): Promise<Assignment[]> {
  try {
    const assignments = await pgQueries.getAssignmentsByClassId.run(
      { classId },
      tc
    )
    return assignments.map(a =>
      makeSomeOptional(a, [
        'description',
        'title',
        'numberOfSessions',
        'minDurationInMinutes',
        'dueDate',
        'startDate',
        'subjectId',
        'studentIds',
      ])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAssignmentById(
  assignmentId: Ulid,
  tc: TransactionClient = getClient()
) {
  try {
    const assignment = await pgQueries.getAssignmentById.run(
      { assignmentId },
      tc
    )

    if (assignment.length) {
      return makeSomeOptional(assignment[0], [
        'description',
        'title',
        'numberOfSessions',
        'minDurationInMinutes',
        'dueDate',
        'startDate',
        'subjectId',
        'subjectName',
      ])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function createStudentAssignment(
  userId: Ulid,
  assignmentId: Ulid,
  tc: TransactionClient = getClient()
) {
  const assignment = await pgQueries.createStudentAssignment.run(
    { userId, assignmentId },
    tc
  )
  if (!assignment.length) {
    throw new RepoCreateError('Unable to create student assignment.')
  }
  return makeSomeRequired(assignment[0], [
    'userId',
    'assignmentId',
    'createdAt',
    'updatedAt',
  ])
}

export async function createStudentAssignments(
  studentAssignments: CreateStudentAssignmentInput[],
  tc: TransactionClient = getClient()
): Promise<CreateStudentAssignmentResult[]> {
  try {
    if (!studentAssignments.length) return []
    const result = await pgQueries.createStudentAssignments.run(
      { studentAssignments },
      tc
    )
    return result.map(r => makeRequired(r))
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function markStudentAssignmentAsCompleted(
  userId: Ulid,
  assignmentId: Uuid,
  tc: TransactionClient = getClient()
) {
  try {
    await pgQueries.updateSubmittedAtOfStudentAssignment.run(
      { userId, assignmentId },
      tc
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function getAssignmentsByStudentId(
  userId: Ulid,
  tc: TransactionClient = getClient()
) {
  try {
    const result = await pgQueries.getAssignmentsByStudentId.run({ userId }, tc)
    const assignments = result.map(assignment => {
      return makeSomeRequired(assignment, [
        'classId',
        'id',
        'isRequired',
        'assignedAt',
      ])
    })

    const assignmentsWithSessions = []
    for (const assignment of assignments) {
      const assignmentSessions = await getSessionsForStudentAssignment(
        userId,
        assignment.id
      )

      const filtered = assignmentSessions.filter(session => {
        if (parseInt(session.timeTutored) === 0) return false
        const timeTutoredInMins = parseInt(session.timeTutored) / 60000

        return timeTutoredInMins >= (assignment.minDurationInMinutes ?? 0)
      })

      assignmentsWithSessions.push({
        ...assignment,
        completedSessions: filtered,
      })
    }

    return assignmentsWithSessions
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAllAssignmentsForTeacher(
  userId: Ulid,
  tc: TransactionClient = getClient()
) {
  try {
    const assignments = await pgQueries.getAllAssignmentsForTeacher.run(
      { userId },
      tc
    )
    return assignments.map(a =>
      makeSomeRequired(a, [
        'classId',
        'id',
        'isRequired',
        'createdAt',
        'updatedAt',
      ])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentAssignmentCompletion(
  assignmentId: Ulid,
  tc: TransactionClient = getClient()
) {
  try {
    const studentAssignments = await pgQueries.getStudentAssignmentCompletion.run(
      { assignmentId },
      tc
    )
    return studentAssignments
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getStudentAssignmentForSession(
  sessionId: Ulid,
  tc: TransactionClient = getClient()
) {
  try {
    const studentAssignment = await pgQueries.getStudentAssignmentForSession.run(
      { sessionId },
      tc
    )
    if (!studentAssignment.length) return
    return makeSomeRequired(studentAssignment[0], [
      'id',
      'isRequired',
      'assignedAt',
    ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function linkSessionToAssignment(
  userId: Ulid,
  sessionId: Uuid,
  assignmentId: Uuid,
  tc: TransactionClient
) {
  try {
    await pgQueries.linkSessionToAssignment.run(
      {
        sessionId,
        userId,
        assignmentId,
      },
      tc
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getSessionsForStudentAssignment(
  userId: Ulid,
  assignmentId: Uuid,
  tc: TransactionClient = getClient()
): Promise<
  { volunteerJoinedAt?: Date; endedAt?: Date; timeTutored: string }[]
> {
  try {
    const sessions = await pgQueries.getSessionsForStudentAssignment.run(
      { userId, assignmentId },
      tc
    )
    return sessions.map(s =>
      makeSomeOptional(s, ['volunteerJoinedAt', 'endedAt'])
    )
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function deleteAssignment(
  assignmentId: Uuid,
  tc: TransactionClient = getClient()
) {
  try {
    await pgQueries.deleteAssignment.run({ assignmentId }, tc)
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}

export async function deleteStudentAssignment(
  assignmentId: Uuid,
  tc: TransactionClient = getClient()
) {
  try {
    await pgQueries.deleteStudentAssignment.run({ assignmentId }, tc)
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}

export async function deleteSessionForStudentAssignment(
  assignmentId: Uuid,
  tc: TransactionClient = getClient()
) {
  try {
    await pgQueries.deleteSessionForStudentAssignment.run({ assignmentId }, tc)
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}

export async function deleteStudentAssignmentByStudentId(
  studentId: Uuid,
  assignmentId: Uuid,
  tc: TransactionClient = getClient()
) {
  try {
    await pgQueries.deleteStudentAssignmentByStudentId.run(
      { studentId, assignmentId },
      tc
    )
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}

export async function deleteSessionStudentAssignmentByStudentId(
  studentId: Uuid,
  assignmentId: Uuid,
  tc: TransactionClient = getClient()
) {
  try {
    await pgQueries.deleteSessionForStudentAssignmentByStudentId.run(
      { studentId, assignmentId },
      tc
    )
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}
