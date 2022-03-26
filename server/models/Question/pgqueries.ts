import {
  RepoCreateError,
  RepoDeleteError,
  RepoReadError,
  RepoUpdateError,
} from '../Errors'
import { makeRequired, makeSomeRequired, Pgid } from '../pgUtils'
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
    const questions = await pgQueries.list.run({ ...filters }, getClient())

    if (questions.length) {
      const result = questions.map(v => makeRequired(v))
      const parsedResult = result.map(res => parseQueryResult(res))
      return parsedResult
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function create(question: PgQuestion): Promise<void> {
  const client = await getClient().connect()
  try {
    await client.query('BEGIN')

    const quizUpsertResult = await pgQueries.upsertQuiz.run(
      { name: question.category },
      client
    )
    const quizId = makeRequired(quizUpsertResult[0]).id

    const subcategoryUpsertResult = await pgQueries.upsertQuizSubcategory.run(
      { name: question.subcategory, quizId },
      client
    )
    const subcategoryId = makeRequired(subcategoryUpsertResult[0]).id

    const result = await pgQueries.create.run(
      {
        questionText: question.questionText,
        possibleAnswers: question.possibleAnswers,
        correctAnswer: question.correctAnswer,
        imageSrc: question.imageSrc,
        subcategoryId,
      },
      client
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new Error('insertion of question did not return ok')

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw new RepoCreateError(err)
  } finally {
    client.release()
  }
}

export type QuestionUpdateOptions = {
  id: Pgid
  question: PgQuestion
}

export async function update(options: QuestionUpdateOptions): Promise<void> {
  const client = await getClient().connect()
  try {
    const question = options.question
    const txt = question.possibleAnswers.map(ans => ans.txt)
    const val = question.possibleAnswers.map(ans => ans.val)

    await client.query('BEGIN')

    const quizUpsertResult = await pgQueries.upsertQuiz.run(
      { name: question.category },
      client
    )
    const quizId = makeRequired(quizUpsertResult[0]).id

    const subcategoryUpsertResult = await pgQueries.upsertQuizSubcategory.run(
      { name: question.subcategory, quizId },
      client
    )
    const subcategoryId = makeRequired(subcategoryUpsertResult[0]).id

    const result = await pgQueries.update.run(
      {
        questionId: options.id,
        correctAnswer: question.correctAnswer,
        imageSrc: question.imageSrc,
        questionText: question.questionText,
        subcategoryId: subcategoryId,
        possibleAnswers: question.possibleAnswers,
      },
      client
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new Error('insertion of question did not return ok')

    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw new RepoUpdateError(err)
  } finally {
    client.release()
  }
}

export async function destroy(questionId: Pgid): Promise<void> {
  try {
    const result = await pgQueries.destroy.run({ questionId }, getClient())
    if (result.length && makeRequired(result[0].ok)) return
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}
