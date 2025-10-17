import _ from 'lodash'
import { captureEvent } from '../services/AnalyticsService'
import {
  TRAINING,
  SUBJECT_TYPES,
  ACCOUNT_USER_ACTIONS,
  QUIZ_USER_ACTIONS,
  EVENTS,
} from '../constants'
import { createQuizAction, createAccountAction } from '../models/UserAction'
import { createContact } from '../services/MailService'
import { Quizzes } from '../models/Volunteer'
import * as VolunteerService from '../services/VolunteerService'
import * as QuestionModel from '../models/Question'
import * as UserModel from '../models/User'
import * as VolunteerModel from '../models/Volunteer'
import * as SubjectsModel from '../models/Subjects'
import { asString } from '../utils/type-utils'
import { Ulid } from '../models/pgUtils'
import { getStandardizedCertsFlag } from '../services/FeatureFlagService'
import { runInTransaction, TransactionClient } from '../db'
import logger from '../logger'

export async function getQuestions(
  category: string,
  userId: Ulid
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
  const isStandardizedCertsActive = await getStandardizedCertsFlag(userId)

  const questionsBySubcategory = _.groupBy(
    questions,
    (question) => question.subcategory
  )

  const shuffledQuestions = _.shuffle(
    Object.entries(questionsBySubcategory).flatMap(([, subQuestions]) =>
      _.sampleSize(subQuestions, questionPerCategory)
    )
  )

  if (isStandardizedCertsActive) {
    captureEvent(userId, EVENTS.FLAGGED_BY_STANDARDIZED_CERTS, {
      event: EVENTS.FLAGGED_BY_STANDARDIZED_CERTS,
      subject: category,
    })
  }
  return isStandardizedCertsActive
    ? shuffledQuestions.slice(0, quiz.totalQuestions)
    : shuffledQuestions
}

type AnswerMap = { [k: number]: string }

// TODO: duck type validation
export interface GetQuizScoreOptions {
  user: UserModel.UserContactInfo
  idAnswerMap: AnswerMap
  category: keyof Quizzes
  ip: string
  skipAvailabilityOnboardingRequirement: boolean
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
    const cert = options.category
    const objIDs = Object.keys(idAnswerMap)
    const numIDs = objIDs.map((id) => Number(id))
    const questions = await QuestionModel.getMultipleQuestionsById(numIDs)
    const SUBJECT_THRESHOLD = 0.8
    const TRAINING_THRESHOLD = 0.9

    const score = questions.filter(
      (question) => question.correctAnswer === idAnswerMap[question.id]
    ).length

    const percent = score / questions.length
    const subjectType = await SubjectsModel.getSubjectType(cert as string)
    const threshold =
      subjectType === SUBJECT_TYPES.TRAINING || !subjectType
        ? TRAINING_THRESHOLD
        : SUBJECT_THRESHOLD
    const passed = percent >= threshold

    const userQuizzesMap = await VolunteerModel.getQuizzesForVolunteers([
      user.id,
    ])
    const userQuizzes = userQuizzesMap[user.id]

    const tries = userQuizzes[cert] ? userQuizzes[cert].tries : 1

    await VolunteerModel.updateVolunteerQuiz(
      user.id,
      options.category as string,
      passed,
      tc
    )

    if (passed) {
      const quizCertUnlocks = await QuestionModel.getQuizCertUnlocksByQuizName(
        asString(cert),
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
          await createQuizAction({
            action: QUIZ_USER_ACTIONS.UNLOCKED_SUBJECT,
            userId: user.id,
            quizSubcategory: subject,
          })
          captureEvent(user.id, EVENTS.SUBJECT_UNLOCKED, {
            event: EVENTS.SUBJECT_UNLOCKED,
            subject,
          })
          await VolunteerModel.addVolunteerCertification(user.id, subject, tc)
        }
      }
      // If volunteer is not onboarded and has completed other onboarding steps - including passing an academic quiz.
      const volunteerProfile =
        await VolunteerModel.getVolunteerForOnboardingById(tc, user.id, {
          includeDeactivated: true,
        })
      const passedUpchieve101 =
        volunteerProfile?.hasCompletedUpchieve101 ||
        cert === TRAINING.UPCHIEVE_101

      // If this is the first quiz the volunteer has passed, and they have passed Upchieve101, send the national tutor certificate email
      if (unlockedSubjects.length === 1 && passedUpchieve101) {
        await VolunteerService.queueNationalTutorCertificateEmail(user.id)
      }
      await VolunteerService.onboardVolunteer(
        user.id,
        ip,
        options.skipAvailabilityOnboardingRequirement,
        tc
      )
    }

    const idCorrectAnswerMap = questions.reduce((correctAnswers, question) => {
      correctAnswers[question.id] = question.correctAnswer
      return correctAnswers
    }, {} as AnswerMap)

    try {
      if (cert === TRAINING.UPCHIEVE_101) await createContact(user.id)
    } catch (err) {
      logger.error('Cannot create sendgrid contact: ' + err)
    }

    return {
      tries,
      passed,
      score,
      idCorrectAnswerMap,
      isTrainingSubject: subjectType === SUBJECT_TYPES.TRAINING,
    }
  })
}
