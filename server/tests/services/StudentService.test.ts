test.skip('postgres migration', () => 1)
/*import { mocked } from 'ts-jest/utils'
import { getFirstName, getObjectId } from '../generate'
import * as StudentRepo from '../../models/Student/queries'
import { getDbUlid } from '../../models/pgUtils'
import * as StudentService from '../../services/StudentService'
import config from '../../config'
import { FavoriteLimitReachedError } from '../../services/Errors'
import * as UserActionCtrl from '../../controllers/UserActionCtrl'
import { UserActionDocument } from '../../models/UserAction'

jest.mock('../../models/Student/queries')

// TODO: figure out how to use jest.mock() on UserActionCtrl
const mockVolunteerFavorited = jest
  .spyOn(UserActionCtrl.AccountActionCreator.prototype, 'volunteerFavorited')
  .mockResolvedValue({} as UserActionDocument)

const mockVolunteerUnfavorited = jest
  .spyOn(UserActionCtrl.AccountActionCreator.prototype, 'volunteerUnfavorited')
  .mockResolvedValue({} as UserActionDocument)

const mockedStudentRepo = mocked(StudentRepo, true)

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
    mockedStudentRepo.getFavoriteVolunteers.mockResolvedValueOnce(expected)

    const result = await StudentService.getFavoriteVolunteersPaginated(
      getDbUlid(),
      page
    )

    expect(result).toEqual(expected)
  })
})

describe('checkAndUpdateVolunteerFavoriting', () => {
  test('Should return true when volunteer is added to student_favorite_volunteers table', async () => {
    const volunteerId = getObjectId()
    const studentId = getObjectId()
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
    expect(mockVolunteerFavorited).toHaveBeenCalledTimes(1)
  })

  test('Should throw error when favorite volunteer limit has been reached', async () => {
    const volunteerId = getObjectId()
    const studentId = getObjectId()
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
      expect(mockVolunteerFavorited).toHaveBeenCalledTimes(0)
    }
  })

  test('Should return the false when volunteer is deleted from student_favorite_volunteers table', async () => {
    const volunteerId = getObjectId()
    const studentId = getObjectId()
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
    expect(mockVolunteerUnfavorited).toHaveBeenCalledTimes(1)
  })

  test('Should return true when volunteer is added to student_favorite_volunteers table with sessionId in the payload', async () => {
    const volunteerId = getObjectId()
    const studentId = getObjectId()
    const sessionId = getObjectId()
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
    expect(mockVolunteerFavorited).toHaveBeenCalledTimes(1)
  })
})
*/
