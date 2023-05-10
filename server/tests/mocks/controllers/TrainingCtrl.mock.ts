import { getPgid, Ulid } from '../../../models/pgUtils'
import * as QuestionRepo from '../../../models/Question'
import * as VolunteerRepo from '../../../models/Volunteer'
import faker from 'faker'
import {
  CERTS,
  CERT_UNLOCKING,
  COLLEGE_CERTS,
  MATH_CERTS,
  READING_WRITING_CERTS,
  SAT_CERTS,
  SCIENCE_CERTS,
  SOCIAL_STUDIES_CERTS,
} from '../../../constants'
import Case from 'case'
import { ExtractValues } from '../../../utils/type-utils'

const testSubcategory = 'test-subcategory'

export type SubcategoriesForQuiz = {
  name: string
}

export const buildSubcategoriesForQuiz = (
  length = 1,
  overrides?: SubcategoriesForQuiz[]
): SubcategoriesForQuiz[] => {
  const subcategories = [] as SubcategoriesForQuiz[]

  for (let i = 0; i < length; i++) {
    subcategories.push({ name: testSubcategory })
  }

  if (overrides) return overrides
  return subcategories
}

export const buildQuiz = (
  overrides?: Partial<QuestionRepo.Quiz>
): QuestionRepo.Quiz => {
  const quiz = {
    id: getPgid(),
    name: 'Test Quiz',
    active: true,
    questionsPerSubcategory: 1,
    ...overrides,
  }

  return quiz
}

export const buildQuestion = (
  overrides: Partial<QuestionRepo.Question> = {}
): QuestionRepo.Question => {
  const question = {
    id: getPgid(),
    questionText: faker.random.words(),
    possibleAnswers: [
      {
        txt: faker.random.words(),
        val: 'a',
      },
      {
        txt: faker.random.words(),
        val: 'b',
      },
      {
        txt: faker.random.words(),
        val: 'c',
      },
      {
        txt: faker.random.words(),
        val: 'd',
      },
    ],
    correctAnswer: 'a',
    category: 'string',
    subcategory: testSubcategory,
    imageSrc: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }

  return question
}

export const buildQuestions = (
  length = 1,
  overrides?: Partial<QuestionRepo.Question>[]
) => {
  const questions = []
  for (let i = 0; i < length; i++) {
    const question = buildQuestion(
      overrides && overrides[i] ? overrides[i] : {}
    )
    questions.push(question)
  }

  return questions
}

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

export const buildQuizResult = (
  overrides?: Partial<VolunteerRepo.QuizInfo>
): VolunteerRepo.QuizInfo => {
  return {
    passed: true,
    tries: 1,
    lastAttemptedAt: new Date(),
    ...overrides,
  }
}

// TODO: Think of a better API for this function
export const buildQuizMap = (
  desiredCerts: CERTS[],
  failedCerts: CERTS[] = []
): VolunteerRepo.Certifications => {
  const map: VolunteerRepo.Certifications = {}
  for (const cert of desiredCerts) {
    map[cert] = {
      passed: true,
      tries: 1,
      lastAttemptedAt: new Date(),
    }
  }

  for (const cert of failedCerts) {
    map[cert] = {
      passed: false,
      tries: 1,
      lastAttemptedAt: new Date(),
    }
  }

  return map
}

export const buildVolunteerQuizMap = (
  userId: Ulid,
  desiredCerts: CERTS[],
  failedCerts: CERTS[] = []
): VolunteerRepo.VolunteerQuizMap => {
  const certs = buildQuizMap(desiredCerts, failedCerts)
  return {
    [userId]: {
      ...certs,
    },
  }
}

/**
 *
 * TODO: Use certs in constants/subjects. It's likely that those constants will
 *       only be used for tests since we generate things from the database now
 *
 *
 * Exclude training related certs
 */
export const OnlyCerts = {
  ...MATH_CERTS,
  ...SCIENCE_CERTS,
  ...COLLEGE_CERTS,
  ...SAT_CERTS,
  ...READING_WRITING_CERTS,
  ...SOCIAL_STUDIES_CERTS,
}

export type OnlyCerts = ExtractValues<typeof OnlyCerts>

// TODO: How to deal topic related details and display ordering?
export const buildQuizUnlockCert = (
  cert: OnlyCerts
): QuestionRepo.QuizUnlockCert[] => {
  const unlockedSubjects = []
  const unlockedCerts = CERT_UNLOCKING[cert]
  for (const unlockedCert of unlockedCerts) {
    const certName = Case.capital(unlockedCert)

    unlockedSubjects.push({
      quizName: unlockedCert,
      quizDisplayName: certName,
      quizDisplayOrder: 1,
      unlockedCertName: unlockedCert,
      unlockedCertDisplayName: certName,
      unlockedCertDisplayOrder: 1,
      // TODO: topicName and topicDisplayName
      topicName: '',
      topicDisplayName: '',
      topicDashboardOrder: 1,
      topicTrainingOrder: 1,
    })
  }

  return unlockedSubjects
}
