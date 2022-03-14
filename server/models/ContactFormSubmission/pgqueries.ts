import { PgContactFormSubmission } from './types'
import { RepoCreateError } from '../Errors'
import { getClient } from '../../pg'
import * as pgQueries from './pg.queries'
import { Ulid, getDbUlid, makeRequired } from '../pgUtils'

export async function createContactFormByUser(userId: Ulid, message: string, topic: string): Promise<PgContactFormSubmission> {
  try {
    const result = await pgQueries.insertContactFormSubmissionByUser.run({
      id: getDbUlid(),
      userId,
      message,
      topic
    }, getClient())
    if (result.length) return makeRequired(result[0])
    throw new RepoCreateError('Insert query did not return new row')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function createContactFormByEmail(userEmail: string, message: string, topic: string): Promise<PgContactFormSubmission> {
  try {
    const result = await pgQueries.insertContactFormSubmissionByEmail.run({
      id: getDbUlid(),
      userEmail,
      message,
      topic
    }, getClient())
    if (result.length) return makeRequired(result[0])
    throw new RepoCreateError('Insert query did not return new row')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}