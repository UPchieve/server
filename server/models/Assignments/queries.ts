import { getClient, TransactionClient } from '../../db'
import { RepoReadError, RepoCreateError } from '../Errors'
import { Assignment, CreateAssignmentPayload } from './types'
import * as pgQueries from './pg.queries'
import { Ulid, getDbUlid, makeSomeOptional } from '../pgUtils'

export async function createAssignment(
  data: CreateAssignmentPayload,
  tc: TransactionClient
): Promise<Assignment> {
  try {
    const assignment = await pgQueries.createAssignment.run(
      {
        id: getDbUlid(),
        classId: data.classId,
        description: data.description,
        title: data.title,
        numberOfSessions: data.numberOfSessions,
        minDurationInMinutes: data.minDurationInMinutes,
        dueDate: data.dueDate,
        isRequired: data.isRequired,
        startDate: data.startDate,
        subjectId: data.subjectId,
      },
      tc
    )
    if (!assignment.length) {
      throw new RepoCreateError('Unable to create assignment.')
    }
    return makeSomeOptional(assignment[0], [
      'description',
      'title',
      'numberOfSessions',
      'minDurationInMinutes',
      'dueDate',
      'startDate',
      'subjectId',
    ])
  } catch (err) {
    throw new RepoCreateError(err)
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
      ])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}
