import { moderateMessage } from '../../services/ModerationService'
import { mocked } from 'jest-mock'
import * as FeatureFlagsService from '../../services/FeatureFlagService'
import * as CensoredSessionMessage from '../../models/CensoredSessionMessage'
import { openai } from '../../services/BotsService'

jest.mock('../../models/CensoredSessionMessage')
jest.mock('../../services/BotsService', () => {
  return {
    openai: {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    },
  }
})

describe('ModerationService', () => {
  const isVolunteer = true
  test('Check incorrect email succeeds', async () => {
    const email = 'j.@serve1.proseware.com'
    expect(
      await moderateMessage({ message: email, senderId: '123', isVolunteer })
    ).toBeTruthy()
  })

  test('Check incorrect phone number succeeds', async () => {
    const phoneNumber =
      'a message including 0.001193067% which is not a phone number'
    expect(
      await moderateMessage({
        message: phoneNumber,
        senderId: '123',
        isVolunteer,
      })
    ).toBeTruthy()
  })

  test('Check correct email fails', async () => {
    const email = 'student1@upchieve.com'
    expect(
      await moderateMessage({ message: email, senderId: '123', isVolunteer })
    ).toBeFalsy()
  })

  test('Check vulgar word fails', async () => {
    const word = '5hit'
    expect(
      await moderateMessage({ message: word, senderId: '123', isVolunteer })
    ).toBeFalsy()
  })

  test('Check non-vulgar word succeeds', async () => {
    const word = 'hello'
    expect(
      await moderateMessage({ message: word, senderId: '123', isVolunteer })
    ).toBeTruthy()
  })

  test('Check correct phone number fails', async () => {
    const phoneNumber =
      'a message including (555)555-5555 which is a phone number'
    expect(
      await moderateMessage({
        message: phoneNumber,
        senderId: '123',
        isVolunteer,
      })
    ).toBeFalsy()
  })

  const mockedFeatureFlagService = mocked(FeatureFlagsService)
  const mockedCensoredSessionMessage = mocked(CensoredSessionMessage)
  test('Check correct phone number fails when ai feature flag is off', async () => {
    mockedFeatureFlagService.getAiModerationFeatureFlag.mockResolvedValue(
      FeatureFlagsService.AI_MODERATION_STATE.disabled
    )
    const message =
      'a message including (555)555-5555 which is a phone number and hi@email.com and bye@email.com which are emails and some profanity: azz. finally a zoom link: https://us05web.zoom.us/j/0123456789'
    const senderId = '123'
    const sessionId = '123'

    mockedCensoredSessionMessage.createCensoredMessage.mockResolvedValue({
      id: '123',
      censoredBy: 'regex',
      sentAt: new Date(),
      senderId,
      sessionId,
      message,
    })

    expect(
      await moderateMessage({
        message,
        senderId,
        isVolunteer,
        sessionId,
      })
    ).toStrictEqual({
      failures: {
        email: ['hi@email.com', 'bye@email.com'],
        phone: [' (555)555-5555 '],
        profanity: ['azz'],
        safety: ['zoom.us'],
      },
    })
  })
  test('Check correct phone number fails when ai feature flag is on and user is in target group', async () => {
    mockedFeatureFlagService.getAiModerationFeatureFlag.mockResolvedValue(
      FeatureFlagsService.AI_MODERATION_STATE.targeted
    )
    const phoneNumber =
      'a message including (555)555-5555 which is a phone number'
    const senderId = '123'
    const sessionId = '123'

    mockedCensoredSessionMessage.createCensoredMessage.mockResolvedValue({
      id: '123',
      censoredBy: 'regex',
      sentAt: new Date(),
      senderId,
      sessionId,
      message: phoneNumber,
    })
    ;(openai.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              appropriate: false,
              reasons: [{ phone: ['(555)555-5555'] }],
            }),
          },
        },
      ],
    })

    expect(
      await moderateMessage({
        message: phoneNumber,
        senderId,
        isVolunteer,
        sessionId,
      })
    ).toStrictEqual({ failures: [{ phone: ['(555)555-5555'] }] })
  })
  test('Check message is clean when ai feature flag is on and user is in target group', async () => {
    mockedFeatureFlagService.getAiModerationFeatureFlag.mockResolvedValue(
      FeatureFlagsService.AI_MODERATION_STATE.targeted
    )
    const message = 'a message including nothing suspicious'
    const senderId = '123'
    const sessionId = '123'

    mockedCensoredSessionMessage.createCensoredMessage.mockResolvedValue({
      id: '123',
      censoredBy: 'regex',
      sentAt: new Date(),
      senderId,
      sessionId,
      message,
    })
    ;(openai.chat.completions.create as jest.Mock).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              appropriate: true,
              reasons: [],
            }),
          },
        },
      ],
    })

    expect(
      await moderateMessage({
        message,
        senderId,
        isVolunteer,
        sessionId,
      })
    ).toStrictEqual({ failures: {} })
  })
})
