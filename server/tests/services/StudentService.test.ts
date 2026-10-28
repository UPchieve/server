import { mocked } from 'jest-mock'
import { getFirstName } from '../mocks/generate'
import * as StudentRepo from '../../models/Student/queries'
import { getDbUlid } from '../../models/pgUtils'
import * as StudentService from '../../services/StudentService'
import * as FavoritingService from '../../services/FavoritingService'
import * as VolunteerService from '../../services/VolunteerService'
import config from '../../config'
import * as UserActionRepo from '../../models/UserAction/queries'
import { ACCOUNT_USER_ACTIONS } from '../../constants'

jest.mock('../../models/Student/queries')
jest.mock('../../models/User/queries')
jest.mock('../../models/UserAction/queries')
jest.mock('../../services/QueueService')
jest.mock('../../services/FavoritingService')
jest.mock('../../services/VolunteerService')

const mockedStudentRepo = mocked(StudentRepo)
const mockedUserActionRepo = mocked(UserActionRepo)
const mockedFavoritingService = mocked(FavoritingService)
const mockedVolunteerService = mocked(VolunteerService)

beforeEach(async () => {
  jest.resetAllMocks()
})

describe('getPastVolunteers', () => {
  test('Should retrieve past volunteers with the stats they chose to share', async () => {
    const lastSession = {
      sessionId: getDbUlid(),
      subjectName: 'algebraOne',
      subjectDisplayName: 'Algebra 1',
      createdAt: new Date(),
      timeTutored: 600000,
    }
    const pastVolunteers = [
      {
        volunteerId: getDbUlid(),
        firstName: getFirstName(),
        numSessions: 3,
        lastSession,
        isFavorite: true,
      },
      {
        volunteerId: getDbUlid(),
        firstName: getFirstName(),
        numSessions: 1,
        lastSession,
        isFavorite: false,
      },
    ]
    const sharedStats = { occupation: ['Retired'], numStudentsHelped: 4 }

    mockedStudentRepo.getPastVolunteersByStudentId.mockResolvedValueOnce(
      pastVolunteers
    )
    mockedVolunteerService.getInfoSharedWithStudents
      .mockResolvedValueOnce(sharedStats)
      .mockResolvedValueOnce(undefined)

    const result =
      await StudentService.getPastVolunteersByStudentId(getDbUlid())

    expect(result).toEqual([
      { ...pastVolunteers[0], publicProfileStats: sharedStats },
      { ...pastVolunteers[1], publicProfileStats: {} },
    ])
    expect(
      mockedVolunteerService.getInfoSharedWithStudents
    ).toHaveBeenCalledWith(pastVolunteers[0].volunteerId)
    expect(
      mockedVolunteerService.getInfoSharedWithStudents
    ).toHaveBeenCalledWith(pastVolunteers[1].volunteerId)
  })
})

describe('checkAndUpdateVolunteerFavoriting', () => {
  test('returns true when volunteer is added to student_favorite_volunteers table', async () => {
    const volunteerId = getDbUlid()
    const studentId = getDbUlid()
    const totalFavorited = 5
    const expectedIsFavorite = true
    mockedStudentRepo.getTotalFavoriteVolunteers.mockResolvedValueOnce(
      totalFavorited
    )
    mockedStudentRepo.addFavoriteVolunteer.mockResolvedValueOnce({
      studentId,
      volunteerId,
    })

    const result = await StudentService.checkAndUpdateVolunteerFavoriting(
      expectedIsFavorite,
      studentId,
      volunteerId
    )

    expect(result?.isFavorite).toEqual(expectedIsFavorite)
    expect(mockedUserActionRepo.createAccountAction).toHaveBeenCalledWith(
      {
        userId: studentId,
        volunteerId: volunteerId,
        sessionId: undefined,
        action: ACCOUNT_USER_ACTIONS.VOLUNTEER_FAVORITED,
      },
      expect.toBeTransactionClient()
    )
    expect(
      mockedFavoritingService.emailFavoritedVolunteer
    ).toHaveBeenCalledWith(volunteerId, studentId)
  })

  test('does not email the volunteer again if the student had already previously favorited them', async () => {
    const volunteerId = getDbUlid()
    const studentId = getDbUlid()
    const expectedIsFavorite = true
    mockedStudentRepo.getTotalFavoriteVolunteers.mockResolvedValueOnce(5)
    mockedStudentRepo.addFavoriteVolunteer.mockResolvedValueOnce(undefined)

    await StudentService.checkAndUpdateVolunteerFavoriting(
      expectedIsFavorite,
      studentId,
      volunteerId
    )

    expect(
      mockedFavoritingService.emailFavoritedVolunteer
    ).not.toHaveBeenCalled()
  })

  test('throws an error when favorite volunteer limit has been reached', async () => {
    const volunteerId = getDbUlid()
    const studentId = getDbUlid()
    const totalFavorited = config.favoriteVolunteerLimit
    const expectedIsFavorite = true
    mockedStudentRepo.getTotalFavoriteVolunteers.mockResolvedValueOnce(
      totalFavorited
    )

    await expect(
      StudentService.checkAndUpdateVolunteerFavoriting(
        expectedIsFavorite,
        studentId,
        volunteerId
      )
    ).rejects.toThrow('Favorite volunteer limit reached')
  })

  test('returns false when volunteer is deleted from student_favorite_volunteers table', async () => {
    const volunteerId = getDbUlid()
    const studentId = getDbUlid()
    const expectedIsFavorite = false

    const result = await StudentService.checkAndUpdateVolunteerFavoriting(
      expectedIsFavorite,
      studentId,
      volunteerId
    )

    expect(result?.isFavorite).toEqual(expectedIsFavorite)
    expect(mockedUserActionRepo.createAccountAction).toHaveBeenCalledWith({
      userId: studentId,
      volunteerId: volunteerId,
      sessionId: undefined,
      action: ACCOUNT_USER_ACTIONS.VOLUNTEER_UNFAVORITED,
    })
    expect(
      mockedFavoritingService.emailFavoritedVolunteer
    ).not.toHaveBeenCalled()
  })

  test('returns true when volunteer is added to student_favorite_volunteers table with sessionId in the payload', async () => {
    const volunteerId = getDbUlid()
    const studentId = getDbUlid()
    const sessionId = getDbUlid()
    const totalFavorited = 5
    const expectedIsFavorite = true
    mockedStudentRepo.getTotalFavoriteVolunteers.mockResolvedValueOnce(
      totalFavorited
    )
    mockedStudentRepo.addFavoriteVolunteer.mockResolvedValueOnce({
      studentId,
      volunteerId,
    })

    const result = await StudentService.checkAndUpdateVolunteerFavoriting(
      expectedIsFavorite,
      studentId,
      volunteerId,
      sessionId
    )

    expect(result?.isFavorite).toEqual(expectedIsFavorite)
    expect(mockedUserActionRepo.createAccountAction).toHaveBeenCalledWith(
      {
        userId: studentId,
        volunteerId: volunteerId,
        sessionId,
        action: ACCOUNT_USER_ACTIONS.VOLUNTEER_FAVORITED,
      },
      expect.toBeTransactionClient()
    )
    expect(
      mockedFavoritingService.emailFavoritedVolunteer
    ).toHaveBeenCalledWith(volunteerId, studentId)
  })
})
