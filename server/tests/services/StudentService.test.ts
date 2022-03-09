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
  test('Should return the volunteer added to the student_favorite_volunteer table', async () => {
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

    const returned = await StudentService.checkAndUpdateVolunteerFavoriting(
      expectedIsFavorite,
      studentId,
      volunteerId
    )

    expect(returned?.result).toEqual(expected)
    expect(returned?.isFavorite).toEqual(expectedIsFavorite)
  })

  test('Should return undefined when favorite volunteer limit has been reached', async () => {
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

    const result = await StudentService.checkAndUpdateVolunteerFavoriting(
      expectedIsFavorite,
      studentId,
      volunteerId
    )

    expect(result).toEqual(undefined)
  })

  test('Should return the volunteer deleted from the student_favorite_volunteer table', async () => {
    const volunteerId = getObjectId()
    const studentId = getObjectId()
    const expected = {
      volunteerId: volunteerId,
      studentId: studentId,
    }
    const expectedIsFavorite = false
    mockedStudentRepo.deleteFavoriteVolunteer.mockResolvedValueOnce(expected)

    const returned = await StudentService.checkAndUpdateVolunteerFavoriting(
      expectedIsFavorite,
      studentId,
      volunteerId
    )

    expect(returned?.result).toEqual(expected)
    expect(returned?.isFavorite).toEqual(expectedIsFavorite)
  })

  test('Should return the volunteer added to the student_favorite_volunteer table with optional sessionId in the payload', async () => {
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

    const returned = await StudentService.checkAndUpdateVolunteerFavoriting(
      expectedIsFavorite,
      studentId,
      volunteerId,
      sessionId
    )

    expect(returned?.result).toEqual(expected)
    expect(returned?.isFavorite).toEqual(expectedIsFavorite)
  })
})
