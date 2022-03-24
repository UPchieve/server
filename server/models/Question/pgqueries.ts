import {
  RepoCreateError,
  RepoDeleteError,
  RepoReadError,
  RepoUpdateError,
} from '../Errors'
import { getPgid, makeRequired, makeSomeRequired, Pgid } from '../pgUtils'
import { PgQuestion } from './types'
import * as pgQueries from './pg.queries'
import { getClient } from '../../pg'

export type PgQuestionQueryResult = Omit<PgQuestion, 'possibleAnswers'> & {
  possibleAnswers: pgQueries.Json
}

export function parseQueryResult(result: PgQuestionQueryResult): PgQuestion {
  const possibleAnswers =
    typeof result.possibleAnswers === 'string'
      ? JSON.parse(result.possibleAnswers)
      : {}

  return { ...result, possibleAnswers }
}

export async function list(filters: any): Promise<PgQuestion[] | undefined> {
  try {
    const result = await pgQueries.list.run({ ...filters }, getClient())

    if (result.length) {
      const parsedResult = result.map(res => parseQueryResult(res))

      return parsedResult.map(v => makeRequired(v))
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function create(question: PgQuestion): Promise<void> {
  try {
    // const txt = question.possibleAnswers.map(ans => ans.txt)
    // const val = question.possibleAnswers.map(ans => ans.val)

    // TODO send val to insert json
    await pgQueries.create.run(
      {
        questionId: getPgid(),
        quizSubcategoryId: getPgid(),
        subjectId: getPgid(),
        ...question,
      },
      getClient()
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export type QuestionUpdateOptions = {
  id: Pgid
  question: PgQuestion
}

export async function update(options: QuestionUpdateOptions): Promise<void> {
  try {
    const question = options.question
    const txt = question.possibleAnswers.map(ans => ans.txt)
    // const val = question.possibleAnswers.map(ans => ans.val)

    // TODO send val to update json
    await pgQueries.update.run(
      {
        questionId: options.id,
        ...question,
        quizSubcategoryId: getPgid(),
        txt,
      },
      getClient()
    )
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

export async function destroy(
  questionId: Pgid
): Promise<PgQuestion | undefined> {
  try {
    // const questionInfo = await pgQueries.getQuestionCategory.run({ questionId }, getClient())
    const result = await pgQueries.destroy.run({ questionId }, getClient())

    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}
