import {
  RepoCreateError,
  RepoDeleteError,
  RepoReadError,
  RepoUpdateError,
} from '../Errors'
import { makeRequired, makeSomeOptional, Pgid } from '../pgUtils'
import { Question, Quiz, QuizUnlockCert, ReviewMaterial } from './types'
import * as pgQueries from './pg.queries'
import { getClient } from '../../db'

export type QuestionQueryResult = Omit<Question, 'possibleAnswers'> & {
  possibleAnswers: pgQueries.Json
}

export function parseQueryResult(result: QuestionQueryResult): Question {
  const possibleAnswers =
    typeof result.possibleAnswers === 'string'
      ? JSON.parse(result.possibleAnswers)
      : result.possibleAnswers

  return { ...result, possibleAnswers, _id: result.id }
}

export async function listQuestions(
  filters: pgQueries.IListParams
): Promise<Question[]> {
  try {
    const questions = await pgQueries.list.run({ ...filters }, getClient())

    const result = questions.map(v => makeSomeOptional(v, ['imageSrc']))
    const parsedResult = result.map(res => parseQueryResult(res))
    return parsedResult
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function createQuestion(question: Question): Promise<Question> {
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

    // pg parser takes any array and makes it a native array, so JSON arrays
    // break it, so we must JSON.stringify any JSON array.
    // https://github.com/adelsz/pgtyped/issues/263
    const result = await pgQueries.create.run(
      {
        questionText: question.questionText,
        possibleAnswers: JSON.stringify(question.possibleAnswers),
        correctAnswer: question.correctAnswer,
        imageSrc: question.imageSrc,
        subcategoryId,
      },
      client
    )
    if (result.length) {
      const newQuestion = makeSomeOptional(result[0], ['imageSrc'])
      const toRtn = parseQueryResult({
        ...newQuestion,
        category: question.category,
        subcategory: question.subcategory,
      })
      await client.query('COMMIT')
      return toRtn
    } else throw new Error('insertion of question did not return new row')
  } catch (err) {
    await client.query('ROLLBACK')
    throw new RepoCreateError(err)
  } finally {
    client.release()
  }
}

export type QuestionUpdateOptions = {
  id: Pgid
  question: Question
}

export async function updateQuestion(
  options: QuestionUpdateOptions
): Promise<Question> {
  const client = await getClient().connect()
  try {
    const question = options.question

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

    // pg parser takes any array and makes it a native array, so JSON arrays
    // break it, so we must JSON.stringify any JSON array.
    // https://github.com/adelsz/pgtyped/issues/263
    const result = await pgQueries.update.run(
      {
        questionId: options.id,
        correctAnswer: question.correctAnswer,
        imageSrc: question.imageSrc,
        questionText: question.questionText,
        subcategoryId: subcategoryId,
        possibleAnswers: JSON.stringify(question.possibleAnswers),
      },
      client
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new Error('insertion of question did not return ok')
    await client.query('COMMIT')
    return question
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

export async function getCategories(): Promise<pgQueries.ICategoriesResult[]> {
  try {
    const result = await pgQueries.categories.run(undefined, getClient())
    return result.map(v => makeRequired(v))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSubcategoriesForQuiz(
  quizName: string
): Promise<pgQueries.IGetSubcategoriesForQuizResult[]> {
  try {
    const result = await pgQueries.getSubcategoriesForQuiz.run(
      { quizName },
      getClient()
    )
    return result.map(v => makeRequired(v))
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getMultipleQuestionsById(
  ids: number[]
): Promise<Question[]> {
  try {
    const questions = await pgQueries.getMultipleQuestionsById.run(
      { ids },
      getClient()
    )
    const result = questions.map(v => makeSomeOptional(v, ['imageSrc']))
    const parsedResult = result.map(res => parseQueryResult(res))
    return parsedResult
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getQuestionsByCategory(
  category: string,
  limit: number,
  offset: number
): Promise<Question[]> {
  try {
    const questions = await pgQueries.getQuestionsByCategory.run(
      { category, limit, offset },
      getClient()
    )
    const result = questions.map(v => makeSomeOptional(v, ['imageSrc']))
    const parsedResult = result.map(res => parseQueryResult(res))
    return parsedResult
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getQuizReviewMaterials(
  category: string
): Promise<ReviewMaterial[]> {
  try {
    const materials = await pgQueries.getQuizReviewMaterials.run(
      { category },
      getClient()
    )
    const result = materials.map(v => makeRequired(v))
    return result
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getQuizByName(
  quizName: string
): Promise<Quiz | undefined> {
  try {
    const results = await pgQueries.getQuizByName.run({ quizName }, getClient())
    if (results.length)
      return { ...makeRequired(results[0]), totalQuestions: 10 }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getQuizCertUnlocksByQuizName(
  quizName: string
): Promise<QuizUnlockCert[]> {
  try {
    const results = await pgQueries.getQuizCertUnlocksByQuizName.run(
      { quizName },
      getClient()
    )
    if (results.length) return results.map(v => makeRequired(v))
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}
