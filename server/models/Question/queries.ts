import { RepoReadError } from '../Errors'
import { makeRequired, makeSomeOptional } from '../pgUtils'
import {
  Question,
  Quiz,
  QuizCertUnlockInfo,
  QuizSubjectUnlockCertInfo,
  ReviewMaterial,
} from './types'
import * as pgQueries from './pg.queries'
import { getClient, TransactionClient } from '../../db'
import { camelCaseKeys } from '../../tests/db-utils'

export type QuestionQueryResult = Omit<Question, 'possibleAnswers'> & {
  possibleAnswers: pgQueries.Json
}

export function parseQueryResult(result: QuestionQueryResult): Question {
  const possibleAnswers =
    typeof result.possibleAnswers === 'string'
      ? JSON.parse(result.possibleAnswers)
      : result.possibleAnswers

  return { ...result, possibleAnswers }
}

export async function listQuestions(
  filters: pgQueries.IListParams
): Promise<Question[]> {
  try {
    const questions = await pgQueries.list.run({ ...filters }, getClient())

    const result = questions.map((v) => makeSomeOptional(v, ['imageSrc']))
    const parsedResult = result.map((res) => parseQueryResult(res))
    return parsedResult
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
    return result.map((v) => makeRequired(v))
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
    const result = questions.map((v) => makeSomeOptional(v, ['imageSrc']))
    const parsedResult = result.map((res) => parseQueryResult(res))
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
    const result = materials.map((v) => makeRequired(v))
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
    if (results.length) {
      return makeRequired(results[0])
    }
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getQuizCertUnlocksByQuizName(
  quizName: string,
  tc?: TransactionClient
): Promise<(QuizSubjectUnlockCertInfo | QuizCertUnlockInfo)[]> {
  try {
    const results = await pgQueries.getQuizCertUnlocksByQuizName.run(
      { quizName },
      tc ?? getClient()
    )
    if (results.length) {
      return results.map((unlock) => {
        const camelCased = camelCaseKeys(unlock)
        if (camelCased.isSubjectCertification) {
          return makeRequired(camelCased) as QuizSubjectUnlockCertInfo
        }
        return {
          quizName: camelCased.quizName,
          isSubjectCertification: camelCased.isSubjectCertification,
          unlockedCertName: camelCased.unlockedCertName,
        } as QuizCertUnlockInfo
      })
    }
    return []
  } catch (err) {
    throw new RepoReadError(err)
  }
}
