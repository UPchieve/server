import * as CacheService from '../../cache'
import * as TextModerationPatternRepo from '../../models/TextModerationPatterns'
import * as TextModerationPatternService from '../../services/TextModerationPatternService'
import { beforeEach } from '@jest/globals'
import { TextModerationPattern } from '../../models/TextModerationPatterns'

jest.mock('../../cache')
jest.mock('../../models/TextModerationPatterns')

const mockedCache = jest.mocked(CacheService)
const mockedRepo = jest.mocked(TextModerationPatternRepo)

const TEXT_MODERATION_PATTERNS: TextModerationPatternRepo.TextModerationPattern[] =
  [
    {
      id: 1,
      regex: /apple|banana/gi,
      rules: null,
    },
    {
      id: 2,
      regex: /mango/i,
      rules: null,
    },
  ]

beforeEach(() => {
  jest.resetAllMocks()
})
describe('getTextModerationPatterns', () => {
  it('Returns patterns from cache', async () => {
    const regex = /apple|banana/
    mockedCache.getIfExists.mockResolvedValue(
      JSON.stringify([
        {
          regex: 'apple|banana',
          flags: 'gi',
          rules: null,
          id: 1,
        },
      ])
    )
    const actual =
      await TextModerationPatternService.getTextModerationPatterns()
    expect(actual.length).toEqual(1)
    expect(actual[0]).toEqual({
      id: 1,
      regex: /apple|banana/gi,
      rules: null,
    } as TextModerationPattern)
    expect(mockedCache.saveWithExpiration).not.toHaveBeenCalled()
    expect(mockedRepo.getTextModerationPatterns).not.toHaveBeenCalled()
  })

  it('Returns pattern from DB if cache miss, and saves DB results to cache', async () => {
    mockedCache.getIfExists.mockResolvedValue(undefined)
    mockedRepo.getTextModerationPatterns.mockResolvedValue(
      TEXT_MODERATION_PATTERNS
    )

    const actual =
      await TextModerationPatternService.getTextModerationPatterns()
    expect(actual).toEqual(TEXT_MODERATION_PATTERNS)
    expect(mockedCache.getIfExists).toHaveBeenCalledTimes(1)
    expect(mockedRepo.getTextModerationPatterns).toHaveBeenCalledTimes(1)
    expect(mockedCache.saveWithExpiration).toHaveBeenCalledTimes(1)
  })

  it('Returns pattern from DB if cache value cannot be parsed / reading from cache errors for some reason', async () => {
    const pattern: TextModerationPattern = {
      id: 1,
      regex: /apple|banana/gi,
      rules: null,
    }
    mockedCache.getIfExists.mockRejectedValueOnce(
      new Error('Could not parse JSON or something')
    )
    mockedRepo.getTextModerationPatterns.mockResolvedValue([pattern])
    const actual =
      await TextModerationPatternService.getTextModerationPatterns()
    expect(actual).toEqual([pattern])
    expect(mockedCache.saveWithExpiration).toHaveBeenCalledTimes(1)
    expect(mockedCache.saveWithExpiration).toHaveBeenCalledWith(
      expect.anything(),
      JSON.stringify([
        {
          id: 1,
          regex: 'apple|banana',
          flags: 'gi',
          rules: null,
        },
      ]),
      expect.anything()
    )
  })
})
