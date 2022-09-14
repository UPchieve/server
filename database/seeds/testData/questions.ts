import client from '../pgClient'
import { NameToId } from '../utils'
import * as pgQueries from './pg.queries'

export async function questions(subcatIds: NameToId): Promise<void> {
  const expected = Object.keys(subcatIds).length
  let inserted = 0
  for (const subcategoryId of Object.values(subcatIds)) {
    const question = {
      questionText: 'test question (answer A)',
      possibleAnswers: [
        {
          txt: 'Pick me',
          val: 'a',
        },
        {
          txt: 'Wrong answer',
          val: 'b',
        },
      ],
      correctAnswer: 'a',
      quizSubcategoryId: subcategoryId as number,
    }
    const result = await pgQueries.insertQuizQuestion.run(question, client)
    if (result.length && result[0].ok) inserted += 1
  }
  if (inserted !== expected)
    console.error(
      `Expected to insert ${expected} questions but only inserted ${inserted}`
    )
}
