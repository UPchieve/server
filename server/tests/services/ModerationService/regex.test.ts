import { beforeEach, describe, expect, test } from '@jest/globals'
import * as Regex from '../../../services/ModerationService/regex'
import { repeat } from 'lodash'
import * as TextModerationPatternService from '../../../services/TextModerationPatternService'
import { TextModerationPattern } from '../../../models/TextModerationPatterns'

jest.mock('../../../services/TextModerationPatternService')

const mockedTextModerationPatternsService = jest.mocked(
  TextModerationPatternService
)
beforeEach(() => {
  jest.resetAllMocks()
  mockedTextModerationPatternsService.getTextModerationPatterns.mockResolvedValue(
    [
      {
        id: 1,
        regex: /apple|banana/gi,
        rules: null,
      } as TextModerationPattern,
    ]
  )
})
describe('regexModerate', () => {
  test('Check incorrect email succeeds', async () => {
    const email = 'j.@serve1.proseware.com'
    const result = await Regex.regexModerate(email)
    expect(result).toEqual({
      isClean: true,
      failures: { failures: {} },
      sanitizedMessage: email,
    })
  })

  test('Check incorrect phone number succeeds', async () => {
    const phoneNumber =
      'a message including 0.001193067% which is not a phone number'
    const result = await Regex.regexModerate(phoneNumber)
    expect(result).toEqual({
      isClean: true,
      failures: { failures: {} },
      sanitizedMessage: phoneNumber,
    })
  })

  test('Check correct email fails', async () => {
    const email = 'student1@upchieve.com'
    const result = await Regex.regexModerate(email)
    expect(result).toEqual({
      isClean: false,
      failures: {
        failures: {
          EMAIL: [email],
        },
      },
      sanitizedMessage: repeat('*', email.length),
    })
  })

  test('Check vulgar word fails', async () => {
    const word = '5hit'
    const result = await Regex.regexModerate(word)
    expect(result).toEqual({
      isClean: false,
      failures: {
        failures: { PROFANITY: [word] },
      },
      sanitizedMessage: repeat('*', word.length),
    })
  })

  test('Check non-vulgar word succeeds', async () => {
    const word = 'hello'
    const result = await Regex.regexModerate(word)
    expect(result).toEqual({
      isClean: true,
      failures: { failures: {} },
      sanitizedMessage: word,
    })
  })

  test('Check correct phone number fails', async () => {
    const badMessage = 'Call me at (555)555-5555'
    const result = await Regex.regexModerate(badMessage)
    expect(result).toEqual({
      isClean: false,
      failures: {
        failures: { PHONE: [' (555)555-5555'] },
      },
      sanitizedMessage: 'Call me at**************',
    })
    expect(!result.sanitizedMessage.includes(badMessage))
  })

  test('Honors passthroughs', async () => {
    const topicId = 1
    mockedTextModerationPatternsService.getTextModerationPatterns.mockResolvedValue(
      [
        {
          id: 1,
          regex: /apple|banana/gi,
          rules: {
            allowForTopicIds: [topicId],
          },
        } as TextModerationPattern,
      ]
    )

    const alwaysAppropriate = await Regex.regexModerate(
      'This message is always appropriate',
      topicId
    )
    expect(alwaysAppropriate.isClean).toEqual(true)
    expect(alwaysAppropriate.failures).toEqual({ failures: {} })

    const forbiddenDueToCustomPattern = await Regex.regexModerate(
      'This message is forbidden bc apple and no topic ID provided'
    )
    expect(forbiddenDueToCustomPattern.isClean).toEqual(false)
    expect(forbiddenDueToCustomPattern.failures).toEqual({
      failures: { PROFANITY: ['apple'] },
    })

    const forbiddenDueToCustomPatternWrongTopic = await Regex.regexModerate(
      'This is still flagged because a different topic ID is provided - apple',
      2
    )
    expect(forbiddenDueToCustomPatternWrongTopic.isClean).toEqual(false)
    expect(forbiddenDueToCustomPatternWrongTopic.failures).toEqual({
      failures: { PROFANITY: ['apple'] },
    })

    const allowedDueToTopicFilter = await Regex.regexModerate(
      'This message with apple is not flagged because of the topic passthrough apple apple apple',
      topicId
    )
    expect(allowedDueToTopicFilter.isClean).toEqual(true)
    expect(allowedDueToTopicFilter.failures).toEqual({ failures: {} })

    const forbiddenDueToOtherMatch = await Regex.regexModerate(
      'This message will get flagged for email: email@upchieve.org apple banana',
      topicId
    )
    expect(forbiddenDueToOtherMatch.isClean).toEqual(false)
    expect(forbiddenDueToOtherMatch.failures).toEqual({
      failures: {
        EMAIL: ['email@upchieve.org'],
      },
    })
  })
})

describe('sanitize', () => {
  it.each([
    ['8608881124', ['8608881124'], '**********'],
    ['call me at 8608881124', ['8608881124'], 'call me at **********'],
    [
      'apple orange banana watermelon',
      ['apple', 'watermelon'],
      '***** orange banana **********',
    ],
    ['nothing to sanitize here', [], 'nothing to sanitize here'],
    [
      'nothing to sanitize here either',
      ['some other', 'words'],
      'nothing to sanitize here either',
    ],
    ['Call me at (555)555-5555', ['(555)555-5555'], 'Call me at *************'],
  ])(
    'Replaces the matches with asterisk *',
    (input: string, matches: string[], expected: string) => {
      expect(Regex.sanitize(input, matches)).toEqual(expected)
    }
  )
})
