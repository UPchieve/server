import { ContactFormSubmission } from './types'
import { RepoCreateError } from '../Errors'
import { getClient } from '../../db'
import * as pgQueries from './pg.queries'
import { Ulid, getDbUlid, makeSomeRequired } from '../pgUtils'

export async function createContactFormByUser(
  userId: Ulid,
  message: string,
  topic: string
): Promise<ContactFormSubmission> {
  try {
    const result = await pgQueries.insertContactFormSubmissionByUser.run(
      {
        id: getDbUlid(),
        userId,
        message,
        topic,
      },
      getClient()
    )
    if (result.length)
      return makeSomeRequired(result[0], [
        'createdAt',
        'id',
        'message',
        'topic',
        'updatedAt',
        'userEmail',
        'userId',
      ])
    throw new RepoCreateError('Insert query did not return new row')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function createContactFormByEmail(
  userEmail: string,
  message: string,
  topic: string
): Promise<ContactFormSubmission> {
  try {
    const result = await pgQueries.insertContactFormSubmissionByEmail.run(
      {
        id: getDbUlid(),
        userEmail: userEmail.toLowerCase(),
        message,
        topic,
      },
      getClient()
    )
    if (result.length)
      return makeSomeRequired(result[0], [
        'createdAt',
        'id',
        'message',
        'topic',
        'updatedAt',
        'userEmail',
        'userId',
      ])
    throw new RepoCreateError('Insert query did not return new row')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
