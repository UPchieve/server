test.skip('postgres migration', () => 1)
/*import mongoose from 'mongoose'
import {
  getQuizScore,
} from '../../controllers/TrainingCtrl'
import { resetDb, insertVolunteer, getVolunteer } from '../db-utils'
import { buildCertifications, buildVolunteer } from '../generate'
import {
  TRAINING,
  MATH_CERTS,
  SCIENCE_CERTS,
  SAT_CERTS,
  SUBJECTS,
  MATH_SUBJECTS,
  SCIENCE_SUBJECTS,
  SAT_SUBJECTS,
  USER_ACTION,
} from '../../constants'
import algebraQuestions from '../../seeds/questions/algebra.json'
import { Certifications } from '../../models/Volunteer'
import * as UserActionRepo from '../../models/UserAction'
import * as VolunteerService from '../../services/VolunteerService'
jest.mock('../../services/MailService')
jest.mock('../../services/VolunteerService')

const buildCertificationsWithUpchieve101 = (options = {}): Certifications => {
  return buildCertifications({
    [TRAINING.UPCHIEVE_101]: { passed: true, tries: 1 },
    ...options,
  })
}

// A helper that returns an answer map with the amount of wrong answers entered
const generateIdAnswerMapHelper = async (
  incorrectAnswerAmount = 0
): Promise<{ [id: string]: string }> => {
  // Only get 12 questions
  const questions = await Question.find({})
    .lean()
    .limit(12)
    .exec()

  const idAnswerList = questions.map(question => {
    const data: any = {}
    const questionId = question._id
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

// db connection
beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

afterAll(async () => {
  await mongoose.connection.close()
})

beforeEach(async () => {
  await resetDb()
})

test.todo('getQuestions tests')
test.todo('getQuizScore tests')

describe('getQuizScore', () => {
  beforeAll(async () => {
    await Question.insertMany(algebraQuestions)
  })

  test('Should onboard a user after completing a math certification, then UPchieve 101, and then Tutoring Skills', async () => {
    const volunteer = await insertVolunteer(
      buildVolunteer({
        availabilityLastModifiedAt: new Date(),
        volunteerPartnerOrg: 'example',
      })
    )

    // Volunteer completes a quiz in Statistics
    const idAnswerMap = await generateIdAnswerMapHelper()
    // TODO: figure out how to set a type for quizScoreInput
    let quizScoreInput: any = {
      user: volunteer,
      category: MATH_CERTS.STATISTICS,
      idAnswerMap,
    }

    let result = await getQuizScore(quizScoreInput)
    let updatedVolunteer = await getVolunteer({ _id: volunteer._id })
    let expectedResult = {
      tries: 1,
      passed: true,
    }
    expect(result).toMatchObject(expectedResult)
    expect(updatedVolunteer.isOnboarded).toBeFalsy()
    expect(
      updatedVolunteer.certifications![MATH_CERTS.STATISTICS].passed
    ).toBeTruthy()

    // Volunteer then completes UPchieve 101
    quizScoreInput = {
      user: updatedVolunteer,
      category: TRAINING.UPCHIEVE_101,
      idAnswerMap,
    }

    result = await getQuizScore(quizScoreInput)
    updatedVolunteer = await getVolunteer({ _id: volunteer._id })
    expectedResult = {
      tries: 1,
      passed: true,
    }

    expect(result).toMatchObject(expectedResult)
    expect(updatedVolunteer.isOnboarded).toBeTruthy()
    expect(
      updatedVolunteer.certifications![TRAINING.UPCHIEVE_101].passed
    ).toBeTruthy()
    expect(VolunteerService.queueOnboardingEventEmails).toBeCalledTimes(1)
    expect(VolunteerService.queuePartnerOnboardingEventEmails).toBeCalledTimes(
      1
    )

    // Volunteer then completes required training for math, Tutoring Skills, to become onboarded
    // @note: Leave commented out until Tutoring Skills course is added
    // quizScoreInput = {
    //   user: updatedVolunteer,
    //   category: TRAINING.TUTORING_SKILLS,
    //   idAnswerMap
    // };

    // result = await getQuizScore(quizScoreInput);
    // updatedVolunteer = await getVolunteer({ _id: volunteer._id });
    // expectedResult = {
    //   tries: 1,
    //   passed: true
    // };

    // expect(result).toMatchObject(expectedResult);
    // expect(updatedVolunteer.isOnboarded).toBeTruthy();
    // expect(
    //   updatedVolunteer.certifications[TRAINING.TUTORING_SKILLS].passed
    // ).toBeTruthy();
  })
  test('Should onboard a user after completing Tutoring Skills, then a math certification, and then UPchieve 101', async () => {
    const volunteer = await insertVolunteer(
      buildVolunteer({ availabilityLastModifiedAt: new Date() })
    )
    // Volunteer first completes required training for Math and Science - Tutoring Skills
    const idAnswerMap = await generateIdAnswerMapHelper()

    let quizScoreInput: any = {
      user: volunteer,
      category: TRAINING.TUTORING_SKILLS,
      idAnswerMap,
    }

    let result = await getQuizScore(quizScoreInput)
    let updatedVolunteer = await getVolunteer({ _id: volunteer._id })
    let expectedResult = {
      tries: 1,
      passed: true,
    }
    expect(result).toMatchObject(expectedResult)
    expect(updatedVolunteer.isOnboarded).toBeFalsy()
    expect(
      updatedVolunteer.certifications![TRAINING.TUTORING_SKILLS].passed
    ).toBeTruthy()

    // Volunteer completes a second course
    quizScoreInput = {
      user: updatedVolunteer,

      category: SCIENCE_CERTS.PHYSICS_TWO,
      idAnswerMap,
    }

    result = await getQuizScore(quizScoreInput)
    updatedVolunteer = await getVolunteer({ _id: volunteer._id })

    expectedResult = {
      tries: 1,
      passed: true,
    }
    expect(result).toMatchObject(expectedResult)
    expect(updatedVolunteer.isOnboarded).toBeFalsy()
    expect(
      updatedVolunteer.certifications![SCIENCE_CERTS.PHYSICS_TWO].passed
    ).toBeTruthy()

    // Volunteer then completes UPchieve 101
    quizScoreInput = {
      user: updatedVolunteer,
      category: TRAINING.UPCHIEVE_101,
      idAnswerMap,
    }

    result = await getQuizScore(quizScoreInput)
    updatedVolunteer = await getVolunteer({ _id: volunteer._id })

    expectedResult = {
      tries: 1,
      passed: true,
    }
    expect(result).toMatchObject(expectedResult)
    expect(updatedVolunteer.isOnboarded).toBeTruthy()
    expect(
      updatedVolunteer.certifications![TRAINING.UPCHIEVE_101].passed
    ).toBeTruthy()
  })
  test('Should onboard a user after completing UPchieve 101, then Tutoring Skills, and then a math certification', async () => {
    const volunteer = await insertVolunteer(
      buildVolunteer({ availabilityLastModifiedAt: new Date() })
    )

    // Volunteer completes UPchieve 101
    const idAnswerMap = await generateIdAnswerMapHelper()

    let quizScoreInput: any = {
      user: volunteer,
      category: TRAINING.UPCHIEVE_101,
      idAnswerMap,
    }

    let result = await getQuizScore(quizScoreInput)
    let updatedVolunteer = await getVolunteer({ _id: volunteer._id })
    let expectedResult = {
      tries: 1,
      passed: true,
    }
    expect(result).toMatchObject(expectedResult)
    expect(updatedVolunteer.isOnboarded).toBeFalsy()
    expect(
      updatedVolunteer.certifications![TRAINING.UPCHIEVE_101].passed
    ).toBeTruthy()

    // Volunteer completes Tutoring Skills
    quizScoreInput = {
      user: updatedVolunteer,
      category: TRAINING.TUTORING_SKILLS,
      idAnswerMap,
    }

    result = await getQuizScore(quizScoreInput)
    updatedVolunteer = await getVolunteer({ _id: volunteer._id })

    expectedResult = {
      tries: 1,
      passed: true,
    }
    expect(result).toMatchObject(expectedResult)
    expect(updatedVolunteer.isOnboarded).toBeFalsy()
    expect(
      updatedVolunteer.certifications![TRAINING.TUTORING_SKILLS].passed
    ).toBeTruthy()

    // Volunteer completes Precalculus
    quizScoreInput = {
      user: updatedVolunteer,
      category: MATH_CERTS.PRECALCULUS,
      idAnswerMap,
    }

    result = await getQuizScore(quizScoreInput)
    updatedVolunteer = await getVolunteer({ _id: volunteer._id })

    expectedResult = {
      tries: 1,
      passed: true,
    }
    expect(result).toMatchObject(expectedResult)
    expect(updatedVolunteer.isOnboarded).toBeTruthy()
    expect(
      updatedVolunteer.certifications![MATH_CERTS.PRECALCULUS].passed
    ).toBeTruthy()
  })

  test('Should create user actions for unlocking a subject', async () => {
    const certifications = buildCertificationsWithUpchieve101({
      [MATH_CERTS.CALCULUS_AB]: { passed: true, tries: 1 },
    })
    const volunteer = await insertVolunteer(
      buildVolunteer({ availabilityLastModifiedAt: new Date(), certifications })
    )

    const idAnswerMap = await generateIdAnswerMapHelper()
    const quizScoreInput = {
      user: volunteer,
      category: TRAINING.TUTORING_SKILLS,
      idAnswerMap,
      ip: '',
    }

    await getQuizScore(quizScoreInput)
    const userActions = await UserActionModel.find({
      action: USER_ACTION.QUIZ.UNLOCKED_SUBJECT,
    })
      .select('quizSubcategory -_id')
      .lean()
      .exec()

    const expectedUserActions = [
      { quizSubcategory: SUBJECTS.PRECALCULUS.toUpperCase() },
      { quizSubcategory: SUBJECTS.TRIGONOMETRY.toUpperCase() },
      { quizSubcategory: SUBJECTS.ALGEBRA_ONE.toUpperCase() },
      { quizSubcategory: SUBJECTS.ALGEBRA_TWO.toUpperCase() },
      { quizSubcategory: SUBJECTS.PREALGREBA.toUpperCase() },
      { quizSubcategory: SUBJECTS.INTEGRATED_MATH_FOUR.toUpperCase() },
    ]

    expect(userActions).toEqual(expect.arrayContaining(expectedUserActions))
  })

  test('Should fail a quiz', async () => {
    const volunteer = await insertVolunteer(
      buildVolunteer({ availabilityLastModifiedAt: new Date() })
    )

    const idAnswerMap = await generateIdAnswerMapHelper(5)
    const quizScoreInput = {
      user: volunteer,
      category: TRAINING.UPCHIEVE_101,
      idAnswerMap,
      ip: '',
    }

    const result = await getQuizScore(quizScoreInput)
    const updatedVolunteer = await getVolunteer({ _id: volunteer._id })

    const expectedResult = {
      tries: 1,
      passed: false,
    }

    expect(result).toMatchObject(expectedResult)
    expect(
      updatedVolunteer.certifications![TRAINING.UPCHIEVE_101].passed
    ).toBeFalsy()
  })

  test('Grace period volunteer (an existing volunteer) should have the same subjects when completing required training', async () => {
    const certifications = buildCertifications({
      [MATH_CERTS.ALGEBRA_TWO]: { passed: true, tries: 1 },
    })
    const subjects = [
      SUBJECTS.PREALGREBA,
      SUBJECTS.ALGEBRA_ONE,
      SUBJECTS.ALGEBRA_TWO,
    ]
    const volunteer = await insertVolunteer(
      buildVolunteer({
        availabilityLastModifiedAt: new Date(),
        subjects,
        certifications,
        isOnboarded: true,
      })
    )

    const idAnswerMap = await generateIdAnswerMapHelper()

    let quizScoreInput: any = {
      user: volunteer,
      category: TRAINING.TUTORING_SKILLS,
      idAnswerMap,
    }
    await getQuizScore(quizScoreInput)
    let updatedVolunteer = await getVolunteer({ _id: volunteer._id })
    expect(updatedVolunteer.subjects).toEqual(subjects)

    quizScoreInput = {
      user: updatedVolunteer,
      category: TRAINING.UPCHIEVE_101,
      idAnswerMap,
    }
    await getQuizScore(quizScoreInput)
    updatedVolunteer = await getVolunteer({ _id: volunteer._id })
    expect(updatedVolunteer.subjects).toEqual(subjects)
  })

  test.todo('Allow existing users to have a grace period for required training')
})
*/
