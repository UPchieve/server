import { mocked } from 'ts-jest/utils'
import { getFirstName } from '../generate'
import * as StudentRepo from '../../models/Student/queries'
import { getDbUlid } from '../../models/pgUtils'
import * as StudentService from '../../services/StudentService'

jest.mock('../../models/Student/queries')

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
