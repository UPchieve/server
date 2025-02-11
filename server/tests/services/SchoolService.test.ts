import * as SchoolRepo from '../../models/School'
import { mocked } from 'jest-mock'
import * as SchoolService from '../../services/SchoolService'
import { faker } from '@faker-js/faker'
import { getDbUlid, Ulid } from '../../models/pgUtils'

jest.mock('../../models/School')
const mockSchoolRepo = mocked(SchoolRepo)

describe('SchoolService', () => {
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

describe('getSchools', () => {
  describe('returns correctly whether isLastPage', () => {
    test('isLastPage = false', async () => {
      mockSchoolRepo.getFilteredSchools.mockResolvedValue([
        // @ts-ignore
        { id: getDbUlid() },
        // @ts-ignore
        { id: getDbUlid() },
        // @ts-ignore
        { id: getDbUlid() },
      ])

      const result = await SchoolService.getSchools({ limit: 2 })
      expect(result.isLastPage).toBe(false)
    })

    test('isLastPage = true', async () => {
      mockSchoolRepo.getFilteredSchools.mockResolvedValue([
        // @ts-ignore
        { id: getDbUlid() },
        // @ts-ignore
        { id: getDbUlid() },
      ])

      const result = await SchoolService.getSchools({ limit: 2 })
      expect(result.isLastPage).toBe(true)
    })
  })
})
