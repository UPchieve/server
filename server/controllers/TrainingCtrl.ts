import _ from 'lodash'
import { captureEvent } from '../services/AnalyticsService'
import { QUIZ_USER_ACTIONS, EVENTS, TRAINING_QUIZZES } from '../constants'
import { createQuizAction } from '../models/UserAction'
import { Quizzes } from '../models/Volunteer'
import * as VolunteerService from '../services/VolunteerService'
import * as QuestionModel from '../models/Question'
import * as UserModel from '../models/User'
import * as VolunteerModel from '../models/Volunteer'
import { asString } from '../utils/type-utils'
import { runInTransaction, TransactionClient } from '../db'
import config from '../config'

export async function getQuestions(
  category: string
): Promise<QuestionModel.Question[]> {
  const subcategories = await QuestionModel.getSubcategoriesForQuiz(category)

  if (!subcategories.length) {
    throw new Error(`No subcategories defined for category: ${category}`)
  }

  const quiz = await QuestionModel.getQuizByName(category)
  if (!quiz) throw new Error(`No quiz created for category: ${category}`)
  const questionPerCategory = quiz.questionsPerSubcategory

  const questions = await QuestionModel.listQuestions({
    category,
    subcategory: null,
  })

  const questionsBySubcategory = _.groupBy(
    questions,
    (question) => question.subcategory
  )

  const shuffledQuestions = _.shuffle(
    Object.entries(questionsBySubcategory).flatMap(([, subQuestions]) =>
      _.sampleSize(subQuestions, questionPerCategory)
    )
  )

  return shuffledQuestions.slice(0, config.totalQuizQuestions)
}

type AnswerMap = { [k: number]: string }

// TODO: duck type validation
export interface GetQuizScoreOptions {
  user: UserModel.UserContactInfo
  idAnswerMap: AnswerMap
  category: keyof Quizzes
  ip?: string
}

export interface GetQuizScoreOutput {
  tries: number
  passed: boolean
  score: number
  idCorrectAnswerMap: any
  isTrainingSubject: boolean
}

export async function getQuizScore(
  options: GetQuizScoreOptions
): Promise<GetQuizScoreOutput> {
  return runInTransaction(async (tc: TransactionClient) => {
    const { user, idAnswerMap, ip } = options
    const quiz = options.category
    const objIDs = Object.keys(idAnswerMap)
    const numIDs = objIDs.map((id) => Number(id))
    const questions = await QuestionModel.getMultipleQuestionsById(numIDs)
    const SUBJECT_THRESHOLD = 0.8
    // @TODO: Once the legacy training quiz ("UPchieve 101 quiz") is fully ripped out,
    // simplify the below logic to `TRAINING_THRESHOLD = 1.0`
    const TRAINING_THRESHOLD =
      quiz === TRAINING_QUIZZES.LEGACY_UPCHIEVE_101 ? 0.9 : 1.0

    const score = questions.filter(
      (question) => question.correctAnswer === idAnswerMap[question.id]
    ).length

    const percent = score / questions.length
    const isTrainingQuiz = Object.values(TRAINING_QUIZZES).includes(
      quiz as TRAINING_QUIZZES
    )
    const threshold = isTrainingQuiz ? TRAINING_THRESHOLD : SUBJECT_THRESHOLD
    const passed = percent >= threshold

    const userQuizzesMap = await VolunteerModel.getQuizzesForVolunteers([
      user.id,
    ])
    const userQuizzes = userQuizzesMap[user.id]

    const tries = userQuizzes[quiz] ? userQuizzes[quiz].tries : 1

    await VolunteerModel.updateVolunteerQuiz(
      user.id,
      options.category as string,
      passed,
      tc
    )

    if (passed) {
      const quizCertUnlocks = await QuestionModel.getQuizCertUnlocksByQuizName(
        asString(quiz),
        tc
      )
      const unlockedSubjects = quizCertUnlocks.map(
        (cert) => cert.unlockedCertName
      )

      const currentSubjects = await VolunteerModel.getSubjectsForVolunteer(
        user.id,
        tc
      )
      // Create a user action for every subject unlocked
      for (const subject of unlockedSubjects) {
        if (!currentSubjects.includes(subject)) {
          await createQuizAction(
            {
              action: QUIZ_USER_ACTIONS.UNLOCKED_SUBJECT,
              userId: user.id,
              quizSubcategory: subject,
            },
            tc
          )
          captureEvent(user.id, EVENTS.SUBJECT_UNLOCKED, {
            event: EVENTS.SUBJECT_UNLOCKED,
            subject,
          })
          await VolunteerModel.addVolunteerCertification(user.id, subject, tc)
        }
      }
      // If volunteer is not onboarded and has completed other onboarding steps - including passing an academic quiz.
      const volunteerProfile =
        await VolunteerService.getVolunteerForOnboardingById(user.id, true, tc)

      // If this is the first quiz the volunteer has passed, and they have passed Upchieve101, send the national tutor certificate email
      if (
        unlockedSubjects.length === 1 &&
        volunteerProfile?.hasCompletedUpchieve101
      ) {
        await VolunteerService.queueNationalTutorCertificateEmail(user.id)
      }
      await VolunteerService.onboardVolunteer(user.id, ip, tc)
    }

    const idCorrectAnswerMap = questions.reduce((correctAnswers, question) => {
      correctAnswers[question.id] = question.correctAnswer
      return correctAnswers
    }, {} as AnswerMap)

    return {
      tries,
      passed,
      score,
      idCorrectAnswerMap,
      isTrainingSubject: isTrainingQuiz,
    }
  })
}
