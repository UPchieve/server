import _ from 'lodash'
import {
  AccountActionCreator,
  QuizActionCreator,
} from '../controllers/UserActionCtrl'
import { captureEvent } from '../services/AnalyticsService'
import QuestionModel, { QuestionDocument } from '../models/Question'
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
  EVENTS,
  SUBJECTS,
  FEATURE_FLAGS,
} from '../constants'
import { getSubjectType } from '../utils/getSubjectType'
import { createContact } from '../services/MailService'
import VolunteerModel, {
  Certifications,
  Volunteer,
  VolunteerDocument,
} from '../models/Volunteer'
import {
  queueOnboardingEventEmails,
  queuePartnerOnboardingEventEmails,
} from '../services/VolunteerService'
import { isEnabled } from 'unleash-client'

// TODO: repo pattern - whole file

// change depending on how many of each subcategory are wanted
const numQuestions = {
  [MATH_CERTS.PREALGREBA]: 2,
  // TODO: remove `algebra` in the algebra 2 launch cleanup
  [MATH_CERTS.ALGEBRA]: 2,
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
}
const SUBJECT_THRESHOLD = 0.8
const TRAINING_THRESHOLD = 0.9

// Check if a user is certified in a given group of subject certs
function isCertifiedIn(givenCerts: any, userCerts: Certifications): boolean {
  for (const cert in givenCerts) {
    const subject = givenCerts[cert] as keyof Certifications
    if (userCerts[subject].passed) return true
  }

  return false
}

export async function getQuestions(
  category: string
): Promise<QuestionDocument[]> {
  const subcategories = QuestionModel.getSubcategories(category)

  if (!subcategories) {
    throw new Error('No subcategories defined for category: ' + category)
  }

  const questions = await QuestionModel.find({
    category,
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
  subjectCert: keyof Certifications,
  userCertifications: Certifications
): boolean {
  const subjectCertType = getSubjectType(subjectCert)

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
  trainingCert: keyof Certifications,
  userCertifications: Certifications
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
  cert: keyof Certifications,
  userCertifications: Certifications
): string[] {
  // update certifications to have the current cert completed set to passed
  Object.assign(userCertifications, {
    [cert]: { passed: true },
    // @note: temporarily bypass training requirements until these training courses are added
    [TRAINING.TUTORING_SKILLS]: { passed: true },
    [TRAINING.COLLEGE_COUNSELING]: { passed: true },
    [TRAINING.SAT_STRATEGIES]: { passed: true },
  })

  // UPchieve 101 must be completed before a volunteer can be onboarded
  if (!userCertifications[TRAINING.UPCHIEVE_101].passed) return []

  const certType = getSubjectType(cert)

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
      userCertifications[cert as keyof Certifications].passed &&
      hasRequiredTraining(cert as keyof Certifications, userCertifications) &&
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

type AnswerMap = { [k: string]: string }

// TODO: duck type validation
export interface GetQuizScoreOptions {
  user: Volunteer
  idAnswerMap: AnswerMap
  category: keyof Certifications
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
  const questions = await QuestionModel.find({ _id: { $in: objIDs } })
    .lean()
    .exec()

  const score = questions.filter(
    question => question.correctAnswer === idAnswerMap[question._id.toString()]
  ).length

  const percent = score / questions.length
  const threshold =
    getSubjectType(cert) === SUBJECT_TYPES.TRAINING
      ? TRAINING_THRESHOLD
      : SUBJECT_THRESHOLD
  const passed = percent >= threshold

  const tries = user.certifications[cert]['tries'] + 1

  const userUpdates: Partial<VolunteerDocument> & { $addToSet?: any } = {
    [`certifications.${cert}.passed`]: passed,
    [`certifications.${cert}.tries`]: tries,
    [`certifications.${cert}.lastAttemptedAt`]: new Date(),
  }

  if (passed) {
    let unlockedSubjects = getUnlockedSubjects(cert, user.certifications)

    // set custom field passedUpchieve101 in SendGrid
    if (cert === TRAINING.UPCHIEVE_101) createContact(user)

    // Create a user action for every subject unlocked
    for (const subject of unlockedSubjects) {
      if (!user.subjects.includes(subject))
        new QuizActionCreator(
          user._id,
          subject as keyof Certifications,
          ip
        ).unlockedSubject()
      captureEvent(user._id, EVENTS.SUBJECT_UNLOCKED, {
        event: EVENTS.SUBJECT_UNLOCKED,
        subject,
      })
    }
    /**
     *
     * algebra certs no longer unlock algebraOne and algebraTwo.
     * When a user takes an algebra quiz, add algebraTwo-temporary
     * instead of algebraTwo to their subjects. This allows for backwards
     * compatibility when the algebra 2 launch feature flag is off
     *
     */
    // TODO: remove this condition in algebra 2 launch cleanup
    if (
      cert === MATH_CERTS.ALGEBRA &&
      !isEnabled(FEATURE_FLAGS.ALGEBRA_TWO_LAUNCH)
    ) {
      unlockedSubjects = unlockedSubjects.filter(
        subject => subject !== MATH_CERTS.ALGEBRA_TWO
      )
      unlockedSubjects.push(SUBJECTS.ALGEBRA_TWO_TEMP)
    }
    userUpdates.$addToSet = { subjects: unlockedSubjects }

    if (
      !user.isOnboarded &&
      user.availabilityLastModifiedAt &&
      unlockedSubjects.length > 0
    ) {
      userUpdates.isOnboarded = true
      queueOnboardingEventEmails(user._id)
      if (user.volunteerPartnerOrg) queuePartnerOnboardingEventEmails(user._id)
      new AccountActionCreator(user._id, ip).accountOnboarded()
      captureEvent(user._id, EVENTS.ACCOUNT_ONBOARDED, {
        event: EVENTS.ACCOUNT_ONBOARDED,
      })
    }
  }

  await VolunteerModel.updateOne({ _id: user._id }, userUpdates, {
    runValidators: true,
  })

  const idCorrectAnswerMap = questions.reduce((correctAnswers, question) => {
    correctAnswers[question._id] = question.correctAnswer
    return correctAnswers
  }, {} as AnswerMap)

  return {
    tries,
    passed,
    score,
    idCorrectAnswerMap,
  }
}
