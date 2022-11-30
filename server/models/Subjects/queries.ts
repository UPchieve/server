import * as pgQueries from './pg.queries'
import { getClient } from '../../db'
import { makeRequired, makeSomeRequired } from '../pgUtils'
import { RepoReadError } from '../Errors'
import { AllSubjectsWithTopics, SubjectAndTopic } from './types'

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

export async function getSubjectsWithTopic(): Promise<AllSubjectsWithTopics> {
  try {
    const result = await pgQueries.getSubjects.run(undefined, getClient())
    const mappedResult = result.map(row =>
      makeSomeRequired(row, ['topicIconLink', 'topicColor'])
    )
    const subjects = {} as AllSubjectsWithTopics
    for (const row of mappedResult) {
      subjects[row.name] = row
    }
    return subjects
  } catch (err) {
    throw new RepoReadError(err)
  }
}
