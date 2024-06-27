import { AssistmentsData } from './types'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { getClient } from '../../db'
import * as pgQueries from './pg.queries'
import { makeSomeOptional, Ulid, getDbUlid } from '../pgUtils'

// When we big bang to pg this file will replace the existing ./queries

export async function getAssistmentsDataBySession(
  sessionId: Ulid
): Promise<AssistmentsData | undefined> {
  try {
    const result = await pgQueries.getAssistmentsDataBySession.run(
      { sessionId },
      getClient()
    )
    if (result.length) {
      return makeSomeOptional(result[0], ['sentAt'])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function updateAssistmentsDataSentById(
  assistmentsDataId: Ulid
): Promise<void> {
  try {
    const result = await pgQueries.updateAssistmentsDataSentById.run(
      { assistmentsDataId },
      getClient()
    )
    if (result.length && result[0].id) return
    throw new RepoUpdateError('Update query did not return id')
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function createAssistmentsDataBySessionId(
  problemId: number,
  assignmentId: Ulid,
  studentId: Ulid,
  sessionId: Ulid
): Promise<AssistmentsData> {
  try {
    const result = await pgQueries.createAssistmentsDataBySessionId.run(
      {
        id: getDbUlid(),
        problemId,
        assignmentId,
        studentId,
        sessionId,
      },
      getClient()
    )
    if (result.length) return makeSomeOptional(result[0], ['sentAt'])
    throw new RepoCreateError('Insert did not return new row')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
