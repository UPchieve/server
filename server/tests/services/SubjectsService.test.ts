import * as CacheService from '../../cache'
import * as FeatureFlagService from '../../services/FeatureFlagService'
import * as SubjectsService from '../../services/SubjectsService'
import logger from '../../logger'
import { SUBJECTS } from '../../constants'
import { getDbUlid } from '../../models/pgUtils'
import {
  DEFAULT_HIGH_LEVEL_SUBJECTS,
  HIGH_LEVEL_SUBJECTS_ENABLED_CACHE_KEY,
  HIGH_LEVEL_SUBJECTS_VALUE_CACHE_KEY,
} from '../../services/SubjectsService'

jest.mock('../../cache')
jest.mock('../../services/FeatureFlagService')
jest.mock('../../logger')

const mockCache = jest.mocked(CacheService)
const mockFeatureFlagService = jest.mocked(FeatureFlagService)
const mockLogger = jest.mocked(logger)

describe('getHighLevelSubjects', () => {
  const subjects: SUBJECTS[] = [
    SUBJECTS.CALCULUS_AB,
    SUBJECTS.CHEMISTRY,
    SUBJECTS.STATISTICS,
  ]

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('Returns values from the cache', async () => {
    mockCache.getIfExists
      .mockResolvedValueOnce('true')
      .mockResolvedValueOnce(JSON.stringify(subjects))
    const actual = await SubjectsService.getHighLevelSubjects(getDbUlid())
    expect(actual).toEqual(subjects)
    expect(mockCache.getIfExists).toHaveBeenCalledTimes(2)
    expect(
      mockFeatureFlagService.getHighLevelSubjectsFeatureFlag
    ).not.toHaveBeenCalled()
    expect(
      mockFeatureFlagService.getHighLevelSubjectsFeatureFlagPayload
    ).not.toHaveBeenCalled()
    expect(mockCache.saveWithExpiration).not.toHaveBeenCalled()
  })

  describe('Returns values from PostHog and updates the cache', () => {
    it('when there are no values in the cache', async () => {
      // Cache miss on enabled key
      mockCache.getIfExists
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined)
      mockFeatureFlagService.getHighLevelSubjectsFeatureFlag.mockResolvedValue(
        true
      )
      mockFeatureFlagService.getHighLevelSubjectsFeatureFlagPayload.mockResolvedValue(
        subjects
      )
      const actual = await SubjectsService.getHighLevelSubjects('user-id')
      expect(actual).toEqual(subjects)
      expect(mockCache.getIfExists).toHaveBeenCalledTimes(2)
      expect(
        mockFeatureFlagService.getHighLevelSubjectsFeatureFlag
      ).toHaveBeenCalled()
      expect(
        mockFeatureFlagService.getHighLevelSubjectsFeatureFlagPayload
      ).toHaveBeenCalled()
      expect(mockCache.saveWithExpiration).toHaveBeenCalledTimes(2)
      expect(mockCache.saveWithExpiration).toHaveBeenNthCalledWith(
        1,
        HIGH_LEVEL_SUBJECTS_ENABLED_CACHE_KEY,
        'true',
        expect.any(Number)
      )
      expect(mockCache.saveWithExpiration).toHaveBeenNthCalledWith(
        2,
        HIGH_LEVEL_SUBJECTS_VALUE_CACHE_KEY,
        JSON.stringify(subjects),
        expect.any(Number)
      )
    })

    it('when the cache is missing only the subjects list', async () => {
      mockCache.getIfExists
        .mockResolvedValueOnce('true') // enabled
        .mockResolvedValueOnce(undefined) // no list stored
      mockFeatureFlagService.getHighLevelSubjectsFeatureFlagPayload.mockResolvedValue(
        subjects
      )
      const actual = await SubjectsService.getHighLevelSubjects('user-id')
      expect(actual).toEqual(subjects)
      expect(mockCache.getIfExists).toHaveBeenCalledTimes(2)
      expect(
        mockFeatureFlagService.getHighLevelSubjectsFeatureFlag
      ).not.toHaveBeenCalled()
      expect(
        mockFeatureFlagService.getHighLevelSubjectsFeatureFlagPayload
      ).toHaveBeenCalled()
      expect(mockCache.saveWithExpiration).toHaveBeenCalledTimes(1)
      expect(mockCache.saveWithExpiration).toHaveBeenCalledWith(
        HIGH_LEVEL_SUBJECTS_VALUE_CACHE_KEY,
        JSON.stringify(subjects),
        expect.any(Number)
      )
    })
  })

  it('Returns the default list on error', async () => {
    mockCache.getIfExists.mockRejectedValueOnce(new Error('Test error'))
    const actual = await SubjectsService.getHighLevelSubjects('user-id')
    expect(actual).toEqual(DEFAULT_HIGH_LEVEL_SUBJECTS)
    expect(mockCache.saveWithExpiration).not.toHaveBeenCalled()
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(String)
    )
  })
})
