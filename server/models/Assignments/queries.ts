import { TransactionClient } from '../../db'
import { RepoCreateError } from '../Errors'
import { Assignment, CreateAssignmentPayload } from './types'
import * as pgQueries from './pg.queries'
import { getDbUlid, makeSomeOptional } from '../pgUtils'

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
