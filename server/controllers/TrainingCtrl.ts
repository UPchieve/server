import _ from 'lodash'
import { captureEvent } from '../services/AnalyticsService'
import {
  CERT_UNLOCKING,
  COMPUTED_CERTS,
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
import { getSubjectType } from '../utils/getSubjectType'
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
      _.sampleSize(
        subQuestions,
        numQuestions[category as keyof typeof numQuestions]
      )
    )
  )
}

// Check if a given cert has the required training completed
export function hasRequiredTraining(
  subjectCert: keyof Quizzes,
  userCertifications: Quizzes
): boolean {
  const subjectCertType = getSubjectType(subjectCert as string)

  if (
    (subjectCertType === SUBJECT_TYPES.MATH ||
      subjectCertType === SUBJECT_TYPES.SCIENCE ||
      subjectCertType === SUBJECT_TYPES.READING_WRITING) &&
    userCertifications[TRAINING.TUTORING_SKILLS].passed
  )
    return true

  if (
    subjectCertType === SUBJECT_TYPES.COLLEGE &&
    userCertifications[TRAINING.COLLEGE_COUNSELING].passed
  )
    return true

  if (
    subjectCertType === SUBJECT_TYPES.SAT &&
    userCertifications[TRAINING.SAT_STRATEGIES].passed
  )
    return true

  return false
}

// Check if a required training cert has any associated passed certifications for it
export function hasCertForRequiredTraining(
  trainingCert: keyof Quizzes,
  userCertifications: Quizzes
): boolean {
  // UPchieve 101 doesn't need any associated certs
  if (trainingCert === TRAINING.UPCHIEVE_101) return true

  // College counseling unlocks Planning and Essays by default, meaning no requirements are needed to unlock the college related certifications besides completing the required training
  if (trainingCert === TRAINING.COLLEGE_COUNSELING) return true

  if (
    trainingCert === TRAINING.TUTORING_SKILLS &&
    isCertifiedIn({ ...MATH_CERTS, ...SCIENCE_CERTS }, userCertifications)
  )
    return true

  if (
    trainingCert === TRAINING.SAT_STRATEGIES &&
    isCertifiedIn(SAT_CERTS, userCertifications)
  )
    return true

  return false
}

export function getUnlockedSubjects(
  cert: keyof Quizzes,
  userCertifications: Quizzes
): string[] {
  // update certifications to have the current cert completed set to passed
  Object.assign(userCertifications, {
    [cert]: { passed: true },
    // @note: temporarily bypass training requirements until these training courses are added
    [TRAINING.TUTORING_SKILLS]: { passed: true },
    [TRAINING.COLLEGE_COUNSELING]: { passed: true },
    [TRAINING.SAT_STRATEGIES]: { passed: true },
  })

  const certType = getSubjectType(cert as string)

  // Check if the user has a certification for the required training
  if (
    certType === SUBJECT_TYPES.TRAINING &&
    !hasCertForRequiredTraining(cert, userCertifications)
  )
    return []

  // Check if the user has completed required training for this cert
  if (
    certType !== SUBJECT_TYPES.TRAINING &&
    !hasRequiredTraining(cert, userCertifications)
  )
    return []

  // Add all the certifications that this completed cert unlocks into a Set
  const currentSubjects = new Set<string>(
    CERT_UNLOCKING[cert as keyof typeof CERT_UNLOCKING]
  )

  for (const cert in userCertifications) {
    // Check that the required training was completed for every certification that a user has
    // Add all the other subjects that a certification unlocks to the Set
    if (
      userCertifications[cert as keyof Quizzes].passed &&
      hasRequiredTraining(cert as keyof Quizzes, userCertifications) &&
      CERT_UNLOCKING[cert as keyof typeof CERT_UNLOCKING]
    )
      CERT_UNLOCKING[cert as keyof typeof CERT_UNLOCKING].forEach(subject =>
        currentSubjects.add(subject)
      )
  }

  // Check if the user has unlocked a new certification based on the current certifications they have
  for (const cert in COMPUTED_CERTS) {
    const prerequisiteCerts =
      COMPUTED_CERTS[cert as keyof typeof COMPUTED_CERTS]
    let meetsRequirements = true

    for (let i = 0; i < prerequisiteCerts.length; i++) {
      const prereqCert = prerequisiteCerts[i]

      if (!currentSubjects.has(prereqCert)) {
        meetsRequirements = false
        break
      }
    }

    if (meetsRequirements) currentSubjects.add(cert)
  }

  return Array.from(currentSubjects)
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
  const threshold =
    getSubjectType(cert as string) === SUBJECT_TYPES.TRAINING
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
    const unlockedSubjects = getUnlockedSubjects(cert, userQuizzes)

    // set custom field passedUpchieve101 in SendGrid
    if (cert === TRAINING.UPCHIEVE_101) await createContact(user.id)

    // Create a user action for every subject unlocked
    for (const subject of unlockedSubjects) {
      const currentSubjects = await VolunteerModel.getSubjectsForVolunteer(
        user.id
      )
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
  }
}
