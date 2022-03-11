import { mocked } from 'ts-jest/utils'
import { getFirstName, getObjectId } from '../generate'
import * as StudentRepo from '../../models/Student/queries'
import { getDbUlid } from '../../models/pgUtils'
import * as StudentService from '../../services/StudentService'
import config from '../../config'
import { Types } from 'mongoose'

jest.mock('../../models/Student/queries')
jest.mock('../../controllers/UserActionCtrl', () => {
  return {
    AccountActionCreator: class AccountActionCreator {
      constructor(
        private userId: Types.ObjectId,
        private ipAddress = '',
        private options = {}
      ) {}

      volunteerFavorited() {
        return jest.fn()
      }
      volunteerUnfavorited() {
        return jest.fn()
      }
    },
  }
})

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
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toBe('Favorite volunteer limit reached.')
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
  })
})
