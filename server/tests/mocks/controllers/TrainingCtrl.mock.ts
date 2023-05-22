import * as QuestionRepo from '../../../models/Question'

export const buildIdAnswerMapHelper = (
  questions: QuestionRepo.Question[],
  incorrectAnswerAmount = 0
): { [id: string]: string } => {
  const idAnswerList = questions.map(question => {
    const data: any = {}
    const questionId = question.id
    data[questionId] = question.correctAnswer

    return data
  })

  const idAnswerMap: any = {}

  for (let i = 0; i < idAnswerList.length; i++) {
    const questionId = Object.keys(idAnswerList[i])[0]
    const correctAnswer = idAnswerList[i][questionId]

    // convert to ASCII and increment then convert back to char to get a wrong answer
    if (i < incorrectAnswerAmount)
      idAnswerMap[questionId] = String.fromCharCode(
        correctAnswer.charCodeAt(0) + 1
      )
    else idAnswerMap[questionId] = correctAnswer
  }

  return idAnswerMap
}
