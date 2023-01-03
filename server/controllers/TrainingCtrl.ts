import _ from 'lodash'
import { captureEvent } from '../services/AnalyticsService'
import {
  TRAINING,
  MATH_CERTS,
  SCIENCE_CERTS,
  SAT_CERTS,
  READING_WRITING_CERTS,
  SUBJECT_TYPES,
  COLLEGE_CERTS,
  ACCOUNT_USER_ACTIONS,
  QUIZ_USER_ACTIONS,
  EVENTS,
  SOCIAL_STUDIES_CERTS,
} from '../constants'
import { createQuizAction, createAccountAction } from '../models/UserAction'
import { createContact } from '../services/MailService'
import { Quizzes } from '../models/Volunteer'
import {
  queueOnboardingEventEmails,
  queuePartnerOnboardingEventEmails,
} from '../services/VolunteerService'
import * as QuestionModel from '../models/Question'
import * as UserModel from '../models/User'
import * as VolunteerModel from '../models/Volunteer'
import * as SubjectsModel from '../models/Subjects'
import { asString } from '../utils/type-utils'

// change depending on how many of each subcategory are wanted
const numQuestions = {
  [MATH_CERTS.PREALGREBA]: 2,
  [MATH_CERTS.ALGEBRA_ONE]: 2,
  [MATH_CERTS.ALGEBRA_TWO]: 1,
  [MATH_CERTS.GEOMETRY]: 2,
  [MATH_CERTS.TRIGONOMETRY]: 2,
  [MATH_CERTS.STATISTICS]: 1,
  [MATH_CERTS.PRECALCULUS]: 2,
  [MATH_CERTS.CALCULUS_AB]: 1,
  [MATH_CERTS.CALCULUS_BC]: 1,
  [COLLEGE_CERTS.ESSAYS]: 3,
  // NOTE: Once College Counseling is implemented Planning and Applications will be phased to subjects that are unlocked instead of certs
  [COLLEGE_CERTS.PLANNING]: 4,
  [COLLEGE_CERTS.APPLICATIONS]: 2,
  [COLLEGE_CERTS.COLLEGE_APPS]: 2,
  [COLLEGE_CERTS.COLLEGE_PREP]: 2,
  [COLLEGE_CERTS.COLLEGE_LIST]: 2,
  [COLLEGE_CERTS.APPLICATION_ESSAYS]: 2,
  [COLLEGE_CERTS.FINANCIAL_AID]: 2,
  [SCIENCE_CERTS.BIOLOGY]: 1,
  [SCIENCE_CERTS.CHEMISTRY]: 1,
  [SCIENCE_CERTS.PHYSICS_ONE]: 1,
  [SCIENCE_CERTS.PHYSICS_TWO]: 1,
  [SCIENCE_CERTS.ENVIRONMENTAL_SCIENCE]: 1,
  [TRAINING.UPCHIEVE_101]: 27,
  [SAT_CERTS.SAT_MATH]: 1,
  [SAT_CERTS.SAT_READING]: 1,
  [READING_WRITING_CERTS.HUMANITIES_ESSAYS]: 1,
  [READING_WRITING_CERTS.READING]: 1,
  [READING_WRITING_CERTS.ESSAY_PLANNING]: 1,
  [READING_WRITING_CERTS.ESSAY_FEEDBACK]: 1,
  [SOCIAL_STUDIES_CERTS.US_HISTORY]: 1,
}
const SUBJECT_THRESHOLD = 0.8
const TRAINING_THRESHOLD = 0.9

// Check if a user is certified in a given group of subject certs
function isCertifiedIn(givenCerts: any, userCerts: Quizzes): boolean {
  for (const cert in givenCerts) {
    const subject = givenCerts[cert] as keyof Quizzes
    if (userCerts[subject]?.passed) return true
  }

  return false
}

export async function getQuestions(
  category: string
): Promise<QuestionModel.Question[]> {
  const subcategories = await QuestionModel.getSubcategoriesForQuiz(category)

  if (!subcategories) {
    throw new Error('No subcategories defined for category: ' + category)
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
    question => question.subcategory
  )

  return _.shuffle(
    Object.entries(questionsBySubcategory).flatMap(([, subQuestions]) =>
      _.sampleSize(subQuestions, questionPerCategory)
    )
  )
}

type AnswerMap = { [k: number]: string }

// TODO: duck type validation
export interface GetQuizScoreOptions {
  user: UserModel.UserContactInfo
  idAnswerMap: AnswerMap
  category: keyof Quizzes
  ip: string
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
  const { user, idAnswerMap, ip } = options
  const cert = options.category
  const objIDs = Object.keys(idAnswerMap)
  const numIDs = objIDs.map(id => Number(id))
  const questions = await QuestionModel.getMultipleQuestionsById(numIDs)

  const score = questions.filter(
    question => question.correctAnswer === idAnswerMap[question.id]
  ).length

  const percent = score / questions.length
  const subjectType = await SubjectsModel.getSubjectType(cert as string)
  if (!subjectType)
    throw new Error(`No subject type found for subject: ${cert}`)
  const threshold =
    subjectType === SUBJECT_TYPES.TRAINING
      ? TRAINING_THRESHOLD
      : SUBJECT_THRESHOLD
  const passed = percent >= threshold

  const userQuizzesMap = await VolunteerModel.getQuizzesForVolunteers([user.id])
  const userQuizzes = userQuizzesMap[user.id]

  const tries = userQuizzes[cert] ? userQuizzes[cert].tries : 1

  await VolunteerModel.updateVolunteerQuiz(
    user.id,
    options.category as string,
    passed
  )

  if (passed) {
    const quizCertUnlocks = await QuestionModel.getQuizCertUnlocksByQuizName(
      asString(cert)
    )
    const unlockedSubjects = quizCertUnlocks.map(cert => cert.unlockedCertName)

    // set custom field passedUpchieve101 in SendGrid
    if (cert === TRAINING.UPCHIEVE_101) await createContact(user.id)

    const currentSubjects = await VolunteerModel.getSubjectsForVolunteer(
      user.id
    )
    // Create a user action for every subject unlocked
    for (const subject of unlockedSubjects) {
      if (!currentSubjects.includes(subject)) {
        await createQuizAction({
          action: QUIZ_USER_ACTIONS.UNLOCKED_SUBJECT,
          userId: user.id,
          quizSubcategory: options.category as string,
        })
        captureEvent(user.id, EVENTS.SUBJECT_UNLOCKED, {
          event: EVENTS.SUBJECT_UNLOCKED,
          subject,
        })
        await VolunteerModel.addVolunteerCertification(user.id, subject)
      }
    }
    // If volunteer is not onboarded and has completed other onboarding steps - including passing an academic quiz
    const volunteerProfile = await VolunteerModel.getVolunteerForOnboardingById(
      user.id
    )
    if (
      volunteerProfile &&
      !volunteerProfile.onboarded &&
      volunteerProfile.availabilityLastModifiedAt &&
      unlockedSubjects.length > 0 &&
      userQuizzes.upchieve101?.passed
    ) {
      await VolunteerModel.updateVolunteerOnboarded(user.id)
      await queueOnboardingEventEmails(user.id)
      // TODO: this should just be done by the generic onboarding email handler above
      if (user.volunteerPartnerOrg)
        await queuePartnerOnboardingEventEmails(user.id)
      await createAccountAction({
        action: ACCOUNT_USER_ACTIONS.ONBOARDED,
        userId: user.id,
        ipAddress: ip,
      })
      captureEvent(user.id, EVENTS.ACCOUNT_ONBOARDED, {
        event: EVENTS.ACCOUNT_ONBOARDED,
      })
    }
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
    isTrainingSubject: subjectType === SUBJECT_TYPES.TRAINING,
  }
}
