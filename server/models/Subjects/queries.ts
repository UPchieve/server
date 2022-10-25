import * as pgQueries from './pg.queries'
import { getClient } from '../../db'
import { makeRequired } from '../pgUtils'
import { RepoReadError } from '../Errors'
import { SubjectAndTopic } from './types'

export async function getSubjectAndTopic(
  subject: string,
  topic: string
): Promise<SubjectAndTopic | undefined> {
  try {
    const result = await pgQueries.getSubjectAndTopic.run(
      { subject, topic },
      getClient()
    )

    if (result.length && makeRequired(result[0])) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}
