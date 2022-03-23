import { RepoCreateError, RepoDeleteError, RepoUpdateError } from '../Errors'
import { getPgid, makeRequired, Pgid } from '../pgUtils'
import { pgQuestion } from './types'
import * as pgQueries from './pg.queries'
import { getClient } from '../../pg'

export async function create(question: pgQuestion) {
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
  question: pgQuestion
}

export async function update(options: QuestionUpdateOptions) {
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

export async function destroy(questionId: Pgid) {
  try {
    const result = await pgQueries.destroy.run({ questionId }, getClient())

    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}
