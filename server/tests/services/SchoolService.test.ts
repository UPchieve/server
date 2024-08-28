import * as SchoolRepo from '../../models/School'
import { mocked } from 'jest-mock'
import * as SchoolService from '../../services/SchoolService'
import { faker } from '@faker-js/faker'
import { getDbUlid, Ulid } from '../../models/pgUtils'

jest.mock('../../models/School')
describe('SchoolService', () => {
  const mockSchoolRepo = mocked(SchoolRepo)

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Trims the query if it is longer than 70 characters', async () => {
    mockSchoolRepo.schoolSearch.mockResolvedValue([
      {
        id: getDbUlid(),
        name: 'Test School',
        city: faker.location.city(),
        state: faker.location.state(),
      },
    ])
    const query = faker.lorem.words(75)
    const firstSeventyChars = query.substring(0, 70)
    expect(query.length).toBeGreaterThan(70)
    expect(firstSeventyChars.length).toEqual(70)

    await SchoolService.search(query)
    expect(mockSchoolRepo.schoolSearch).toHaveBeenCalledWith(firstSeventyChars)
  })
})
