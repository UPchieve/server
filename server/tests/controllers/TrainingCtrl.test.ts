import { mocked } from 'jest-mock'
import { getQuestions, getQuizScore } from '../../controllers/TrainingCtrl'
import { buildVolunteer } from '../mocks/generate'
import {
  MATH_CERTS,
  CERTS,
  SUBJECT_TYPES,
  QUIZ_USER_ACTIONS,
  EVENTS,
  ACCOUNT_USER_ACTIONS,
  TRAINING_QUIZZES,
} from '../../constants'
import * as UserActionRepo from '../../models/UserAction'
import * as QuestionRepo from '../../models/Question'
import * as SubjectsRepo from '../../models/Subjects'
import * as VolunteerRepo from '../../models/Volunteer'
import * as AnalyticsService from '../../services/AnalyticsService'
import * as VolunteerService from '../../services/VolunteerService'
import { buildIdAnswerMapHelper } from '../mocks/controllers/TrainingCtrl.mock'
import {
  buildSubcategoriesForQuiz,
  buildQuiz,
  buildQuestions,
  buildQuizSubjectUnlockCert,
} from '../mocks/repos/question-repo.mock'
import { buildVolunteerQuizMap } from '../mocks/repos/volunteer-repo.mock'
import config from '../../config'
jest.mock('../../services/VolunteerService')
jest.mock('../../services/AnalyticsService')
jest.mock('../../models/Question')
jest.mock('../../models/Subjects')
jest.mock('../../models/Volunteer')
jest.mock('../../models/UserAction')

const mockedQuestionRepo = mocked(QuestionRepo)
const mockedSubjectsRepo = mocked(SubjectsRepo)
const mockedVolunteerRepo = mocked(VolunteerRepo)
const mockedVolunteerService = mocked(VolunteerService)

beforeEach(async () => {
  jest.clearAllMocks()
})

describe('getQuestions', () => {
  test('Should throw error when no subcategories exist', async () => {
    const subject = MATH_CERTS.ALGEBRA_ONE
    mockedQuestionRepo.getSubcategoriesForQuiz.mockResolvedValueOnce([])
    await expect(async () => {
      await getQuestions(subject)
    }).rejects.toThrow(`No subcategories defined for category: ${subject}`)
  })

  test('Should throw error when no quiz exist', async () => {
    const subject = MATH_CERTS.ALGEBRA_ONE
    const subcategories = buildSubcategoriesForQuiz()
    mockedQuestionRepo.getSubcategoriesForQuiz.mockResolvedValueOnce(
      subcategories
    )
    mockedQuestionRepo.getQuizByName.mockResolvedValueOnce(undefined)
    await expect(async () => {
      await getQuestions(subject)
    }).rejects.toThrow(`No quiz created for category: ${subject}`)
  })

  test('Successfully retrieves quiz questions', async () => {
    const subject = MATH_CERTS.ALGEBRA_ONE
    const subcategories = buildSubcategoriesForQuiz()
    const quiz = buildQuiz({ questionsPerSubcategory: 2 })
    const questions = buildQuestions(2)
    mockedQuestionRepo.getSubcategoriesForQuiz.mockResolvedValueOnce(
      subcategories
    )
    mockedQuestionRepo.getQuizByName.mockResolvedValueOnce(quiz)
    mockedQuestionRepo.listQuestions.mockResolvedValueOnce(questions)

    const result = await getQuestions(subject)
    expect(result).toHaveLength(2)
  })

  test('should have quiz questions be length defined in config', async () => {
    const subject = MATH_CERTS.ALGEBRA_TWO
    const subcategories = buildSubcategoriesForQuiz()

    const quiz = buildQuiz({ questionsPerSubcategory: 2 })
    const questions = buildQuestions(config.totalQuizQuestions + 1, [
      { subcategory: '1' },
      { subcategory: '2' },
      { subcategory: '3' },
      { subcategory: '4' },
      { subcategory: '5' },
      { subcategory: '6' },
      { subcategory: '7' },
      { subcategory: '8' },
      { subcategory: '9' },
      { subcategory: '10' },
      { subcategory: '11' },
    ])
    mockedQuestionRepo.getSubcategoriesForQuiz.mockResolvedValueOnce(
      subcategories
    )
    mockedQuestionRepo.getQuizByName.mockResolvedValueOnce(quiz)
    mockedQuestionRepo.listQuestions.mockResolvedValueOnce(questions)

    const result = await getQuestions(subject)
    expect(result).toHaveLength(config.totalQuizQuestions)
  })
})

describe('getQuizScore', () => {
  test('Fails subject quiz', async () => {
    const volunteer = buildVolunteer()
    const questions = buildQuestions()
    const cert = CERTS.ALGEBRA_ONE
    const idAnswerMap = buildIdAnswerMapHelper(questions, questions.length)
    const mockQuizMap = buildVolunteerQuizMap(volunteer.id, [CERTS.ALGEBRA_ONE])
    // TODO: figure out how to set a type for quizScoreInput
    const quizScoreInput: any = {
      user: volunteer,
      category: cert,
      idAnswerMap,
    }

    mockedQuestionRepo.getMultipleQuestionsById.mockResolvedValueOnce(questions)
    mockedSubjectsRepo.getSubjectType.mockResolvedValueOnce(SUBJECT_TYPES.MATH)
    mockedVolunteerRepo.getQuizzesForVolunteers.mockResolvedValueOnce(
      mockQuizMap
    )

    const result = await getQuizScore(quizScoreInput)
    // TODO: Figure out how to include `idAnswerMap` with correct mapping into expectedResult
    const expectedResult = {
      tries: 1,
      passed: false,
      score: 0,
      isTrainingSubject: false,
    }

    expect(VolunteerRepo.updateVolunteerQuiz).toHaveBeenCalledWith(
      volunteer.id,
      cert,
      false,
      expect.toBeTransactionClient()
    )
    expect(UserActionRepo.createQuizAction).not.toHaveBeenCalledWith({
      action: QUIZ_USER_ACTIONS.UNLOCKED_SUBJECT,
      userId: volunteer.id,
      quizSubcategory: cert,
    })
    expect(AnalyticsService.captureEvent).not.toHaveBeenCalledWith(
      volunteer.id,
      EVENTS.SUBJECT_UNLOCKED,
      {
        event: EVENTS.SUBJECT_UNLOCKED,
        subject: cert,
      }
    )
    expect(VolunteerRepo.addVolunteerCertification).not.toHaveBeenCalledWith(
      volunteer.id,
      cert
    )
    expect(VolunteerService.onboardVolunteer).not.toHaveBeenCalled()
    expect(result).toMatchObject(expectedResult)
  })

  test(`Passes subject quiz, isn't onboarded and doesn't become onboarded because no availability has been selected`, async () => {
    const volunteer = buildVolunteer()
    const questions = buildQuestions()
    const cert = CERTS.ALGEBRA_ONE
    const idAnswerMap = buildIdAnswerMapHelper(questions)
    const mockQuizMap = buildVolunteerQuizMap(volunteer.id, [])
    const unlockedCerts = buildQuizSubjectUnlockCert(cert)
    const unlockedSubjectNames = unlockedCerts.map(
      (cert) => cert.unlockedCertName
    )
    const currentSubjects: string[] = []
    const mockVolunteerForOnboarding = {
      id: volunteer.id,
      email: volunteer.email,
      firstName: volunteer.firstName,
      onboarded: false,
      approved: false,
      subjects: [],
      country: 'USA',
      availabilityLastModifiedAt: undefined,
      hasCompletedUpchieve101: true,
    }
    // TODO: figure out how to set a type for quizScoreInput
    const quizScoreInput: any = {
      user: volunteer,
      category: cert,
      idAnswerMap,
    }

    mockedQuestionRepo.getMultipleQuestionsById.mockResolvedValueOnce(questions)
    mockedSubjectsRepo.getSubjectType.mockResolvedValueOnce(SUBJECT_TYPES.MATH)
    mockedVolunteerRepo.getQuizzesForVolunteers.mockResolvedValueOnce(
      mockQuizMap
    )
    mockedQuestionRepo.getQuizCertUnlocksByQuizName.mockResolvedValueOnce(
      unlockedCerts
    )
    mockedVolunteerRepo.getSubjectsForVolunteer.mockResolvedValueOnce(
      currentSubjects
    )
    mockedVolunteerService.getVolunteerForOnboardingById.mockResolvedValueOnce(
      mockVolunteerForOnboarding
    )

    const result = await getQuizScore(quizScoreInput)
    const expectedResult = {
      tries: 1,
      passed: true,
      score: 1,
      idCorrectAnswerMap: idAnswerMap,
      isTrainingSubject: false,
    }

    expect(VolunteerRepo.updateVolunteerQuiz).toHaveBeenCalledWith(
      volunteer.id,
      cert,
      true,
      expect.toBeTransactionClient()
    )
    for (const subject of unlockedSubjectNames) {
      expect(UserActionRepo.createQuizAction).toHaveBeenCalledWith(
        {
          action: QUIZ_USER_ACTIONS.UNLOCKED_SUBJECT,
          userId: volunteer.id,
          quizSubcategory: subject,
        },
        expect.anything()
      )
      expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
        volunteer.id,
        EVENTS.SUBJECT_UNLOCKED,
        {
          event: EVENTS.SUBJECT_UNLOCKED,
          subject,
        }
      )
      expect(VolunteerRepo.addVolunteerCertification).toHaveBeenCalledWith(
        volunteer.id,
        subject,
        expect.toBeTransactionClient()
      )
    }
    expect(VolunteerService.onboardVolunteer).toHaveBeenCalledWith(
      volunteer.id,
      undefined,
      expect.toBeTransactionClient()
    )
    expect(VolunteerRepo.updateVolunteerOnboarded).not.toHaveBeenCalled()
    expect(VolunteerService.queueOnboardingEventEmails).not.toHaveBeenCalled()
    expect(UserActionRepo.createAccountAction).not.toHaveBeenCalledWith({
      action: ACCOUNT_USER_ACTIONS.ONBOARDED,
      userId: volunteer.id,
      ipAddress: '',
    })
    expect(AnalyticsService.captureEvent).not.toHaveBeenCalledWith(
      volunteer.id,
      EVENTS.ACCOUNT_ONBOARDED,
      {
        event: EVENTS.ACCOUNT_ONBOARDED,
      }
    )
    expect(result).toEqual(expectedResult)
  })

  test(`Passes subject quiz, isn't onboarded and doesn't become onboarded because hasn't passed 101 training`, async () => {
    const volunteer = buildVolunteer()
    const questions = buildQuestions()
    const cert = CERTS.ALGEBRA_ONE
    const idAnswerMap = buildIdAnswerMapHelper(questions)
    const mockQuizMap = buildVolunteerQuizMap(volunteer.id, [])
    const unlockedCerts = buildQuizSubjectUnlockCert(cert)
    const unlockedSubjectNames = unlockedCerts.map(
      (cert) => cert.unlockedCertName
    )
    const currentSubjects: string[] = []
    const mockVolunteerForOnboarding = {
      id: volunteer.id,
      email: volunteer.email,
      firstName: volunteer.firstName,
      onboarded: false,
      approved: false,
      subjects: [],
      country: 'USA',
      availabilityLastModifiedAt: new Date(),
      hasCompletedUpchieve101: false,
    }
    // TODO: figure out how to set a type for quizScoreInput
    const quizScoreInput: any = {
      user: volunteer,
      category: cert,
      idAnswerMap,
    }

    mockedQuestionRepo.getMultipleQuestionsById.mockResolvedValueOnce(questions)
    mockedSubjectsRepo.getSubjectType.mockResolvedValueOnce(SUBJECT_TYPES.MATH)
    mockedVolunteerRepo.getQuizzesForVolunteers.mockResolvedValueOnce(
      mockQuizMap
    )
    mockedQuestionRepo.getQuizCertUnlocksByQuizName.mockResolvedValueOnce(
      unlockedCerts
    )
    mockedVolunteerRepo.getSubjectsForVolunteer.mockResolvedValueOnce(
      currentSubjects
    )
    mockedVolunteerService.getVolunteerForOnboardingById.mockResolvedValueOnce(
      mockVolunteerForOnboarding
    )

    const result = await getQuizScore(quizScoreInput)
    const expectedResult = {
      tries: 1,
      passed: true,
      score: 1,
      idCorrectAnswerMap: idAnswerMap,
      isTrainingSubject: false,
    }
    expect(VolunteerRepo.updateVolunteerQuiz).toHaveBeenCalledWith(
      volunteer.id,
      cert,
      true,
      expect.toBeTransactionClient()
    )
    for (const subject of unlockedSubjectNames) {
      expect(UserActionRepo.createQuizAction).toHaveBeenCalledWith(
        {
          action: QUIZ_USER_ACTIONS.UNLOCKED_SUBJECT,
          userId: volunteer.id,
          quizSubcategory: subject,
        },
        expect.anything()
      )
      expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
        volunteer.id,
        EVENTS.SUBJECT_UNLOCKED,
        {
          event: EVENTS.SUBJECT_UNLOCKED,
          subject,
        }
      )
      expect(VolunteerRepo.addVolunteerCertification).toHaveBeenCalledWith(
        volunteer.id,
        subject,
        expect.toBeTransactionClient()
      )
    }
    expect(VolunteerService.onboardVolunteer).toHaveBeenCalledWith(
      volunteer.id,
      undefined,
      expect.toBeTransactionClient()
    )
    expect(result).toEqual(expectedResult)
  })

  test(`Passes training quiz, isn't onboarded and doesn't become onboarded because hasn't passed subject quiz`, async () => {
    const volunteer = buildVolunteer()
    const questions = buildQuestions()
    const cert = CERTS.UPCHIEVE_101
    const idAnswerMap = buildIdAnswerMapHelper(questions)
    const mockQuizMap = buildVolunteerQuizMap(volunteer.id, [])
    // TODO: fix `any` type. Should be an empty array
    const unlockedCerts: any = []
    const currentSubjects: string[] = []
    const mockVolunteerForOnboarding = {
      id: volunteer.id,
      email: volunteer.email,
      firstName: volunteer.firstName,
      onboarded: false,
      approved: false,
      subjects: [],
      country: 'USA',
      availabilityLastModifiedAt: new Date(),
      hasCompletedUpchieve101: false,
    }
    // TODO: figure out how to set a type for quizScoreInput
    const quizScoreInput: any = {
      user: volunteer,
      category: cert,
      idAnswerMap,
    }

    mockedQuestionRepo.getMultipleQuestionsById.mockResolvedValueOnce(questions)
    mockedSubjectsRepo.getSubjectType.mockResolvedValueOnce(
      SUBJECT_TYPES.TRAINING
    )
    mockedVolunteerRepo.getQuizzesForVolunteers.mockResolvedValueOnce(
      mockQuizMap
    )
    mockedQuestionRepo.getQuizCertUnlocksByQuizName.mockResolvedValueOnce(
      unlockedCerts
    )
    mockedVolunteerRepo.getSubjectsForVolunteer.mockResolvedValueOnce(
      currentSubjects
    )
    mockedVolunteerService.getVolunteerForOnboardingById.mockResolvedValueOnce(
      mockVolunteerForOnboarding
    )

    const result = await getQuizScore(quizScoreInput)
    const expectedResult = {
      tries: 1,
      passed: true,
      score: 1,
      idCorrectAnswerMap: idAnswerMap,
      isTrainingSubject: true,
    }
    expect(VolunteerRepo.updateVolunteerQuiz).toHaveBeenCalledWith(
      volunteer.id,
      cert,
      true,
      expect.toBeTransactionClient()
    )

    expect(UserActionRepo.createQuizAction).not.toHaveBeenCalledWith({
      action: QUIZ_USER_ACTIONS.UNLOCKED_SUBJECT,
      userId: volunteer.id,
      quizSubcategory: cert,
    })
    expect(AnalyticsService.captureEvent).not.toHaveBeenCalledWith(
      volunteer.id,
      EVENTS.SUBJECT_UNLOCKED,
      {
        event: EVENTS.SUBJECT_UNLOCKED,
        subject: cert,
      }
    )
    expect(VolunteerRepo.addVolunteerCertification).not.toHaveBeenCalledWith(
      volunteer.id,
      cert
    )
    expect(VolunteerService.onboardVolunteer).toHaveBeenCalledWith(
      volunteer.id,
      undefined,
      expect.toBeTransactionClient()
    )
    expect(result).toEqual(expectedResult)
  })

  test('Passes subject quiz and becomes onboarded', async () => {
    const volunteer = buildVolunteer()
    const questions = buildQuestions()
    const cert = CERTS.ALGEBRA_ONE
    const idAnswerMap = buildIdAnswerMapHelper(questions)
    const mockQuizMap = buildVolunteerQuizMap(volunteer.id, [
      CERTS.UPCHIEVE_101,
    ])
    const unlockedCerts = buildQuizSubjectUnlockCert(cert)
    const unlockedSubjectNames = unlockedCerts.map(
      (cert) => cert.unlockedCertName
    )
    const currentSubjects: string[] = []
    const mockVolunteerForOnboarding = {
      id: volunteer.id,
      email: volunteer.email,
      firstName: volunteer.firstName,
      onboarded: false,
      approved: false,
      subjects: [],
      country: 'USA',
      availabilityLastModifiedAt: new Date(),
      hasCompletedUpchieve101: true,
    }
    // TODO: figure out how to set a type for quizScoreInput
    const quizScoreInput: any = {
      user: volunteer,
      category: cert,
      idAnswerMap,
    }

    mockedQuestionRepo.getMultipleQuestionsById.mockResolvedValueOnce(questions)
    mockedSubjectsRepo.getSubjectType.mockResolvedValueOnce(SUBJECT_TYPES.MATH)
    mockedVolunteerRepo.getQuizzesForVolunteers.mockResolvedValueOnce(
      mockQuizMap
    )
    mockedQuestionRepo.getQuizCertUnlocksByQuizName.mockResolvedValueOnce(
      unlockedCerts
    )
    mockedVolunteerRepo.getSubjectsForVolunteer.mockResolvedValueOnce(
      currentSubjects
    )
    mockedVolunteerService.getVolunteerForOnboardingById.mockResolvedValueOnce(
      mockVolunteerForOnboarding
    )

    const result = await getQuizScore(quizScoreInput)
    const expectedResult = {
      tries: 1,
      passed: true,
      score: 1,
      idCorrectAnswerMap: idAnswerMap,
      isTrainingSubject: false,
    }
    expect(VolunteerRepo.updateVolunteerQuiz).toHaveBeenCalledWith(
      volunteer.id,
      cert,
      true,
      expect.toBeTransactionClient()
    )

    for (const subject of unlockedSubjectNames) {
      expect(UserActionRepo.createQuizAction).toHaveBeenCalledWith(
        {
          action: QUIZ_USER_ACTIONS.UNLOCKED_SUBJECT,
          userId: volunteer.id,
          quizSubcategory: subject,
        },
        expect.anything()
      )
      expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
        volunteer.id,
        EVENTS.SUBJECT_UNLOCKED,
        {
          event: EVENTS.SUBJECT_UNLOCKED,
          subject,
        }
      )
      expect(VolunteerRepo.addVolunteerCertification).toHaveBeenCalledWith(
        volunteer.id,
        subject,
        expect.toBeTransactionClient()
      )
    }
    expect(VolunteerService.onboardVolunteer).toHaveBeenCalledWith(
      volunteer.id,
      undefined,
      expect.toBeTransactionClient()
    )
    expect(result).toEqual(expectedResult)
  })

  test('Passes LEGACY training quiz and becomes onboarded', async () => {
    const volunteer = buildVolunteer()
    const questions = buildQuestions()
    const cert = CERTS.UPCHIEVE_101
    const idAnswerMap = buildIdAnswerMapHelper(questions)
    const mockQuizMap = buildVolunteerQuizMap(volunteer.id, [CERTS.ALGEBRA_ONE])
    // TODO: fix type. Should be an empty array
    const unlockedCerts: any = []
    const currentSubjects = [CERTS.PREALGREBA, CERTS.ALGEBRA_ONE]
    const mockVolunteerForOnboarding = {
      id: volunteer.id,
      email: volunteer.email,
      firstName: volunteer.firstName,
      onboarded: false,
      approved: false,
      subjects: currentSubjects,
      country: 'USA',
      availabilityLastModifiedAt: new Date(),
      hasCompletedUpchieve101: true,
    }
    // TODO: figure out how to set a type for quizScoreInput
    const quizScoreInput: any = {
      user: volunteer,
      category: cert,
      idAnswerMap,
    }

    mockedQuestionRepo.getMultipleQuestionsById.mockResolvedValueOnce(questions)
    mockedSubjectsRepo.getSubjectType.mockResolvedValueOnce(
      SUBJECT_TYPES.TRAINING
    )
    mockedVolunteerRepo.getQuizzesForVolunteers.mockResolvedValueOnce(
      mockQuizMap
    )
    mockedQuestionRepo.getQuizCertUnlocksByQuizName.mockResolvedValueOnce(
      unlockedCerts
    )
    mockedVolunteerRepo.getSubjectsForVolunteer.mockResolvedValueOnce(
      currentSubjects
    )
    mockedVolunteerService.getVolunteerForOnboardingById.mockResolvedValueOnce(
      mockVolunteerForOnboarding
    )

    const result = await getQuizScore(quizScoreInput)
    const expectedResult = {
      tries: 1,
      passed: true,
      score: 1,
      idCorrectAnswerMap: idAnswerMap,
      isTrainingSubject: true,
    }

    expect(VolunteerRepo.updateVolunteerQuiz).toHaveBeenCalledWith(
      volunteer.id,
      cert,
      true,
      expect.toBeTransactionClient()
    )
    expect(UserActionRepo.createQuizAction).not.toHaveBeenCalledWith({
      action: QUIZ_USER_ACTIONS.UNLOCKED_SUBJECT,
      userId: volunteer.id,
      quizSubcategory: cert,
    })
    expect(AnalyticsService.captureEvent).not.toHaveBeenCalledWith(
      volunteer.id,
      EVENTS.SUBJECT_UNLOCKED,
      {
        event: EVENTS.SUBJECT_UNLOCKED,
        subject: cert,
      }
    )
    expect(VolunteerRepo.addVolunteerCertification).not.toHaveBeenCalledWith(
      volunteer.id,
      cert
    )
    expect(VolunteerService.onboardVolunteer).toHaveBeenCalledWith(
      volunteer.id,
      undefined,
      expect.toBeTransactionClient()
    )
    expect(result).toEqual(expectedResult)
  })

  test('Passes subject quiz and is already onboarded', async () => {
    const volunteer = buildVolunteer()
    const questions = buildQuestions()
    const cert = CERTS.CALCULUS_AB
    const idAnswerMap = buildIdAnswerMapHelper(questions)
    const mockQuizMap = buildVolunteerQuizMap(volunteer.id, [CERTS.ALGEBRA_ONE])
    const unlockedCerts = buildQuizSubjectUnlockCert(cert)
    const currentSubjects = [CERTS.PREALGREBA, CERTS.ALGEBRA_ONE]
    const unlockedSubjectNames = unlockedCerts
      .map((cert) => {
        // TODO: fix `any` type coercion
        if (!currentSubjects.includes(cert.unlockedCertName as any))
          return cert.unlockedCertName
      })
      .filter((subject) => !!subject)
    const mockVolunteerForOnboarding = {
      id: volunteer.id,
      email: volunteer.email,
      firstName: volunteer.firstName,
      onboarded: true,
      approved: false,
      subjects: currentSubjects,
      country: 'USA',
      availabilityLastModifiedAt: new Date(),
      hasCompletedUpchieve101: true,
    }
    // TODO: figure out how to set a type for quizScoreInput
    const quizScoreInput: any = {
      user: volunteer,
      category: cert,
      idAnswerMap,
    }

    mockedQuestionRepo.getMultipleQuestionsById.mockResolvedValueOnce(questions)
    mockedSubjectsRepo.getSubjectType.mockResolvedValueOnce(SUBJECT_TYPES.MATH)
    mockedVolunteerRepo.getQuizzesForVolunteers.mockResolvedValueOnce(
      mockQuizMap
    )
    mockedQuestionRepo.getQuizCertUnlocksByQuizName.mockResolvedValueOnce(
      unlockedCerts
    )
    mockedVolunteerRepo.getSubjectsForVolunteer.mockResolvedValueOnce(
      currentSubjects
    )
    mockedVolunteerService.getVolunteerForOnboardingById.mockResolvedValueOnce(
      mockVolunteerForOnboarding
    )

    const result = await getQuizScore(quizScoreInput)
    const expectedResult = {
      tries: 1,
      passed: true,
      score: 1,
      idCorrectAnswerMap: idAnswerMap,
      isTrainingSubject: false,
    }
    expect(VolunteerRepo.updateVolunteerQuiz).toHaveBeenCalledWith(
      volunteer.id,
      cert,
      true,
      expect.toBeTransactionClient()
    )

    for (const subject of unlockedSubjectNames) {
      expect(UserActionRepo.createQuizAction).toHaveBeenCalledWith(
        {
          action: QUIZ_USER_ACTIONS.UNLOCKED_SUBJECT,
          userId: volunteer.id,
          quizSubcategory: subject,
        },
        expect.anything()
      )
      expect(AnalyticsService.captureEvent).toHaveBeenCalledWith(
        volunteer.id,
        EVENTS.SUBJECT_UNLOCKED,
        {
          event: EVENTS.SUBJECT_UNLOCKED,
          subject,
        }
      )
      expect(VolunteerRepo.addVolunteerCertification).toHaveBeenCalledWith(
        volunteer.id,
        subject,
        expect.toBeTransactionClient()
      )
    }
    expect(VolunteerService.onboardVolunteer).toHaveBeenCalledWith(
      volunteer.id,
      undefined,
      expect.toBeTransactionClient()
    )
    expect(result).toEqual(expectedResult)
  })

  test('Fails the non-legacy training quiz if less than 100% of answers are correct', async () => {
    const volunteer = buildVolunteer()
    const questions = buildQuestions(3)
    const quiz = TRAINING_QUIZZES.COACHING_STRATEGIES
    const numIncorrectAnswers = 1
    const idAnswerMap = buildIdAnswerMapHelper(questions, numIncorrectAnswers)
    const mockQuizMap = buildVolunteerQuizMap(volunteer.id, [])

    mockedQuestionRepo.getMultipleQuestionsById.mockResolvedValueOnce(questions)
    mockedVolunteerRepo.getQuizzesForVolunteers.mockResolvedValue(mockQuizMap)

    const actual = await getQuizScore({
      user: volunteer,
      idAnswerMap,
      category: quiz,
      ip: 'test-ip',
    })
    expect(actual).toEqual({
      tries: 1,
      passed: false,
      score: questions.length - numIncorrectAnswers,
      idCorrectAnswerMap: buildIdAnswerMapHelper(questions),
      isTrainingSubject: true,
    })

    expect(
      mockedQuestionRepo.getQuizCertUnlocksByQuizName
    ).not.toHaveBeenCalled()
    expect(VolunteerRepo.getSubjectsForVolunteer).not.toHaveBeenCalled()
    expect(UserActionRepo.createQuizAction).not.toHaveBeenCalled()
    expect(mockedVolunteerRepo.addVolunteerCertification).not.toHaveBeenCalled()
    expect(
      mockedVolunteerService.getVolunteerForOnboardingById
    ).not.toHaveBeenCalled()
    expect(
      mockedVolunteerService.queueNationalTutorCertificateEmail
    ).not.toHaveBeenCalled()
  })

  test('Passes non-legacy training quiz if 100% of answers are correct', async () => {
    const volunteer = buildVolunteer()
    const questions = buildQuestions(3)
    const quiz = TRAINING_QUIZZES.COACHING_STRATEGIES
    const idAnswerMap = buildIdAnswerMapHelper(questions)
    const mockQuizMap = buildVolunteerQuizMap(volunteer.id, [])

    mockedQuestionRepo.getMultipleQuestionsById.mockResolvedValueOnce(questions)
    mockedVolunteerRepo.getQuizzesForVolunteers.mockResolvedValue(mockQuizMap)
    mockedQuestionRepo.getQuizCertUnlocksByQuizName.mockResolvedValue([])

    const actual = await getQuizScore({
      user: volunteer,
      idAnswerMap,
      category: quiz,
      ip: 'test-ip',
    })
    expect(actual).toEqual({
      tries: 1,
      passed: true,
      score: questions.length,
      idCorrectAnswerMap: buildIdAnswerMapHelper(questions),
      isTrainingSubject: true,
    })

    expect(mockedQuestionRepo.getQuizCertUnlocksByQuizName).toHaveBeenCalled()
    expect(VolunteerRepo.getSubjectsForVolunteer).toHaveBeenCalled()
    expect(
      mockedVolunteerService.getVolunteerForOnboardingById
    ).toHaveBeenCalled()

    // No certs for training quiz
    expect(UserActionRepo.createQuizAction).not.toHaveBeenCalled()
    expect(mockedVolunteerRepo.addVolunteerCertification).not.toHaveBeenCalled()
    expect(
      mockedVolunteerService.queueNationalTutorCertificateEmail
    ).not.toHaveBeenCalled()
  })
})
