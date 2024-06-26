import { mocked } from 'jest-mock'
import { getFirstName } from '../mocks/generate'
import * as StudentRepo from '../../models/Student/queries'
import * as UserRepo from '../../models/User/queries'
import { getDbUlid } from '../../models/pgUtils'
import * as StudentService from '../../services/StudentService'
import config from '../../config'
import { FavoriteLimitReachedError } from '../../services/Errors'
import * as UserActionRepo from '../../models/UserAction/queries'
import { ACCOUNT_USER_ACTIONS } from '../../constants'
import QueueService from '../../services/QueueService'
import { Jobs } from '../../worker/jobs'

jest.mock('../../models/Student/queries')
jest.mock('../../models/User/queries')
jest.mock('../../models/UserAction/queries')
jest.mock('../../services/QueueService')

const mockedStudentRepo = mocked(StudentRepo)
const mockedUserRepo = mocked(UserRepo)
const mockedUserActionRepo = mocked(UserActionRepo)

beforeEach(async () => {
  jest.resetAllMocks()
})

describe('getFavoriteVolunteersPaginated', () => {
  test('Should retrieve a list of favorited volunteers and if is last page for data', async () => {
    const page = 2
    const expected = {
      favoriteVolunteers: [
        {
          volunteerId: getDbUlid(),
          firstName: getFirstName(),
          numSessions: 3,
        },
        {
          volunteerId: getDbUlid(),
          firstName: getFirstName(),
          numSessions: 0,
        },
        {
          volunteerId: getDbUlid(),
          firstName: getFirstName(),
          numSessions: 10,
        },
      ],
      isLastPage: true,
    }
    mockedStudentRepo.getFavoriteVolunteersPaginated.mockResolvedValueOnce(
      expected
    )

    const result = await StudentService.getFavoriteVolunteersPaginated(
      getDbUlid(),
      page
    )

    expect(result).toEqual(expected)
  })
})

describe('checkAndUpdateVolunteerFavoriting', () => {
  test('Should return true when volunteer is added to student_favorite_volunteers table', async () => {
    const volunteerId = getDbUlid()
    const studentId = getDbUlid()
    const totalFavorited = 5
    const expected = {
      volunteerId: volunteerId,
      studentId: studentId,
    }
    const expectedIsFavorite = true
    mockedStudentRepo.getTotalFavoriteVolunteers.mockResolvedValueOnce(
      totalFavorited
    )
    mockedStudentRepo.addFavoriteVolunteer.mockResolvedValueOnce(expected)

    const result = await StudentService.checkAndUpdateVolunteerFavoriting(
      expectedIsFavorite,
      studentId,
      volunteerId
    )

    expect(result.isFavorite).toEqual(expectedIsFavorite)
    expect(mockedUserActionRepo.createAccountAction).toHaveBeenCalledWith({
      userId: studentId,
      volunteerId: volunteerId,
      sessionId: undefined,
      action: ACCOUNT_USER_ACTIONS.VOLUNTEER_FAVORITED,
    })
  })

  test('Should throw error when favorite volunteer limit has been reached', async () => {
    const volunteerId = getDbUlid()
    const studentId = getDbUlid()
    const totalFavorited = config.favoriteVolunteerLimit
    const expected = {
      volunteerId: volunteerId,
      studentId: studentId,
    }
    const expectedIsFavorite = true
    mockedStudentRepo.getTotalFavoriteVolunteers.mockResolvedValueOnce(
      totalFavorited
    )
    mockedStudentRepo.addFavoriteVolunteer.mockResolvedValueOnce(expected)

    try {
      await StudentService.checkAndUpdateVolunteerFavoriting(
        expectedIsFavorite,
        studentId,
        volunteerId
      )
    } catch (error) {
      expect(error).toBeInstanceOf(FavoriteLimitReachedError)
      expect((error! as FavoriteLimitReachedError).message).toBe(
        'Favorite volunteer limit reached.'
      )
    }
  })

  test('Should return the false when volunteer is deleted from student_favorite_volunteers table', async () => {
    const volunteerId = getDbUlid()
    const studentId = getDbUlid()
    const expected = {
      volunteerId: volunteerId,
      studentId: studentId,
    }
    const expectedIsFavorite = false
    mockedStudentRepo.deleteFavoriteVolunteer.mockResolvedValueOnce(expected)

    const result = await StudentService.checkAndUpdateVolunteerFavoriting(
      expectedIsFavorite,
      studentId,
      volunteerId
    )

    expect(result.isFavorite).toEqual(expectedIsFavorite)
    expect(mockedUserActionRepo.createAccountAction).toHaveBeenCalledWith({
      userId: studentId,
      volunteerId: volunteerId,
      sessionId: undefined,
      action: ACCOUNT_USER_ACTIONS.VOLUNTEER_UNFAVORITED,
    })
  })

  test('Should return true when volunteer is added to student_favorite_volunteers table with sessionId in the payload', async () => {
    const volunteerId = getDbUlid()
    const studentId = getDbUlid()
    const sessionId = getDbUlid()
    const totalFavorited = 5
    const expected = {
      volunteerId: volunteerId,
      studentId: studentId,
    }
    const expectedIsFavorite = true
    mockedStudentRepo.getTotalFavoriteVolunteers.mockResolvedValueOnce(
      totalFavorited
    )
    mockedStudentRepo.addFavoriteVolunteer.mockResolvedValueOnce(expected)

    const result = await StudentService.checkAndUpdateVolunteerFavoriting(
      expectedIsFavorite,
      studentId,
      volunteerId,
      sessionId
    )

    expect(result.isFavorite).toEqual(expectedIsFavorite)
    expect(mockedUserActionRepo.createAccountAction).toHaveBeenCalledWith({
      userId: studentId,
      volunteerId: volunteerId,
      sessionId,
      action: ACCOUNT_USER_ACTIONS.VOLUNTEER_FAVORITED,
    })
  })
})

describe('queueProcrastinationTextReminder', () => {
  test('Should update and queue text reminder', async () => {
    const studentId = getDbUlid()
    const phoneNumber = '+12345678900'
    const reminderDate = '09-21-2023 08:00'

    mockedUserRepo.updateUserPhoneNumberByUserId.mockResolvedValueOnce()

    await StudentService.queueProcrastinationTextReminder(
      studentId,
      phoneNumber,
      reminderDate
    )

    expect(mockedUserRepo.updateUserPhoneNumberByUserId).toHaveBeenCalledTimes(
      1
    )
    expect(QueueService.add).toHaveBeenCalledWith(
      Jobs.StudentProcrastinationTextReminder,
      {
        userId: studentId,
      },
      // The delay is dynamic, based on current time
      expect.anything()
    )
  })
})
