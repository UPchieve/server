import * as CacheService from '../../cache'
import * as SubjectsRepo from '../../models/Subjects'
import * as SubjectsService from '../../services/SubjectsService'
import { SUBJECTS } from '../../constants'
import { COMPUTED_SUBJECT_UNLOCKS_CACHE_KEY } from '../../services/SubjectsService'
import { ComputedSubjectUnlocks } from '../../models/Subjects'

jest.mock('../../cache')
jest.mock('../../models/Subjects')

const mockedCacheService = jest.mocked(CacheService)
const mockedSubjectsRepo = jest.mocked(SubjectsRepo)

beforeEach(() => {
  jest.resetAllMocks()
})

describe('getCachedComputedSubjectUnlocks', () => {
  const computedSubjectUnlocksMapping = {
    [SUBJECTS.INTEGRATED_MATH_ONE]: [SUBJECTS.STATISTICS, SUBJECTS.GEOMETRY],
    [SUBJECTS.INTEGRATED_MATH_TWO]: [
      SUBJECTS.PRECALCULUS,
      SUBJECTS.ALGEBRA_ONE,
    ],
  } as ComputedSubjectUnlocks

  it('Returns from the cache', async () => {
    mockedCacheService.getIfExists.mockResolvedValue(
      JSON.stringify(computedSubjectUnlocksMapping)
    )

    const actual = await SubjectsService.getCachedComputedSubjectUnlocks()

    expect(actual).toEqual(computedSubjectUnlocksMapping)
    expect(
      mockedSubjectsRepo.getRequiredCertificationsByComputedSubjectUnlock
    ).not.toHaveBeenCalled()
    expect(mockedCacheService.saveWithExpiration).not.toHaveBeenCalled()
  })

  it('Queries the database if there is no cached value, and writes it to cache', async () => {
    mockedCacheService.getIfExists.mockResolvedValue(undefined)
    mockedSubjectsRepo.getRequiredCertificationsByComputedSubjectUnlock.mockResolvedValue(
      computedSubjectUnlocksMapping
    )

    const actual = await SubjectsService.getCachedComputedSubjectUnlocks()

    expect(actual).toEqual(computedSubjectUnlocksMapping)
    expect(mockedCacheService.getIfExists).toHaveBeenCalledWith(
      COMPUTED_SUBJECT_UNLOCKS_CACHE_KEY
    )
    expect(
      mockedSubjectsRepo.getRequiredCertificationsByComputedSubjectUnlock
    ).toHaveBeenCalled()
    expect(mockedCacheService.saveWithExpiration).toHaveBeenCalledWith(
      COMPUTED_SUBJECT_UNLOCKS_CACHE_KEY,
      JSON.stringify(computedSubjectUnlocksMapping),
      expect.any(Number)
    )
  })
})
