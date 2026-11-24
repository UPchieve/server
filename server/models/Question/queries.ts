import { RepoReadError } from '../Errors'
import { makeSomeRequired } from '../pgUtils'
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

    const result = questions.map((v) =>
      makeSomeRequired(v, [
        'category',
        'correctAnswer',
        'createdAt',
        'id',
        'possibleAnswers',
        'questionText',
        'subcategory',
        'updatedAt',
      ])
    )
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
    return result.map((v) => makeSomeRequired(v, ['name']))
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
    const result = questions.map((v) =>
      makeSomeRequired(v, [
        'category',
        'correctAnswer',
        'createdAt',
        'id',
        'possibleAnswers',
        'questionText',
        'subcategory',
        'updatedAt',
      ])
    )
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
    const result = materials.map((v) =>
      makeSomeRequired(v, ['category', 'image', 'pdf', 'title'])
    )
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
      return makeSomeRequired(results[0], [
        'active',
        'id',
        'name',
        'questionsPerSubcategory',
      ])
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
          return makeSomeRequired(camelCased, [
            'isSubjectCertification',
            'quizDisplayName',
            'quizDisplayOrder',
            'quizName',
            'topicDashboardOrder',
            'topicDisplayName',
            'topicName',
            'topicTrainingOrder',
            'unlockedCertDisplayName',
            'unlockedCertDisplayOrder',
            'unlockedCertName',
          ]) as QuizSubjectUnlockCertInfo
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
