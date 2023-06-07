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
import {
  queueOnboardingEventEmails,
  queuePartnerOnboardingEventEmails,
} from '../services/VolunteerService'
import * as QuestionModel from '../models/Question'
import * as UserModel from '../models/User'
import * as VolunteerModel from '../models/Volunteer'
import * as SubjectsModel from '../models/Subjects'
import { asString } from '../utils/type-utils'
import { Ulid } from '../models/pgUtils'
import { getStandardizedCertsFlag } from '../services/FeatureFlagService'

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
  const filteredSubcategoryQuestions = filterSubtopicsFromQuestions(
    category,
    questions
  )
  const questionsBySubcategory = _.groupBy(
    isStandardizedCertsActive ? filteredSubcategoryQuestions : questions,
    question => question.subcategory
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
  const SUBJECT_THRESHOLD = 0.8
  const TRAINING_THRESHOLD = 0.9

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
          quizSubcategory: subject,
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
    const hasSubjects =
      unlockedSubjects.length > 0 || currentSubjects.length > 0
    const passedUpchieve101 =
      volunteerProfile?.hasCompletedUpchieve101 ||
      cert === TRAINING.UPCHIEVE_101
    if (
      volunteerProfile &&
      !volunteerProfile.onboarded &&
      volunteerProfile.availabilityLastModifiedAt &&
      hasSubjects &&
      passedUpchieve101
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

// TODO: Remove in medium-certs-v2 clean up
export function filterSubtopicsFromQuestions(
  subject: string,
  questions: QuestionModel.Question[]
): QuestionModel.Question[] {
  const filterSubtopicsOut: { [subject: string]: string[] } = {
    '6thGradeMath': [
      'ratios',
      'area',
      'polygons',
      'exponents',
      'factoring',
      'doubleNumberLine',
      'SEL',
      'middleSchool',
    ],
    '7thGradeMath': [
      'ratio',
      'propertiesof',
      'scalefactor',
      'areaofcircle',
      'prisms',
      'visual3',
      'SEL',
    ],
    '8thGradeMath': [
      'middleSchool',
      'SEL',
      'linearEquations',
      'functions',
      'geometryCongruence',
      'volume',
      'Exponents',
      'scatterPlots',
      'geometryDialations',
      'pythagoreanTheorem',
    ],
    // no subtopics to filter
    prealgebra: [],
    // no subtopics to filter
    algebraOne: [],
    algebraTwo: [
      'rounding_and_scientific_notation',
      'functions_domain',
      'rational_expressions',
      'square_root_equations',
      'arithmetic_and_geometric_sequences',
    ],
    // no subtopics to filter
    geometry: [],
    trigonometry: ['trig functions', 'pythagorean theorem', 'right triangles'],
    // no subtopics to filter
    statistics: [],
    // no subtopics to filter
    precalculus: [],
    // no subtopics to filter
    calculusAB: [],
    // no subtopics to filter
    calculusBC: [],
    biology: ['the cell'],
    // no subtopics to filter
    chemistry: [],
    // no subtopics to filter
    physicsOne: [],
    // no subtopics to filter
    physicsTwo: [],
    // no subtopics to filter
    environmentalScience: [],
    // no subtopics to filter
    reading: [],
    essayPlanning: [
      // had a space
      'set expectations',
      'planning steps',
      'outlines',
      'types of essays',
      'common requests',
    ],
    essayFeedback: [
      'types of essays',
      'basics',
      'passage details',
      'structure',
      'passage unity',
      'conclusion',
      'passage thesis',
      'punctuation',
      'wordiness',
      'nonvarying sentence length',
      'specificity and coherence',
      'common requests',
      'independent and dependent clauses',
    ],
    // no subtopics to filter
    usHistory: [],
    // no subtopics to filter
    worldHistory: [],
    collegePrep: ['timeline'],
    collegeList: ['research', 'cost'],
    // no subtopics to filter
    collegeApps: [],
    // no subtopics to filter
    applicationEssays: [],
    financialAid: ['special', 'source', 'direct', 'FAFSA advanced', 'CSS'],
    // no subtopics to filter
    satMath: [],
    // no subtopics to filter
    satReading: [],
  }

  const subtopicsToFilter = new Set(filterSubtopicsOut[subject])
  return questions.filter(q => !subtopicsToFilter.has(q.subcategory))
}
