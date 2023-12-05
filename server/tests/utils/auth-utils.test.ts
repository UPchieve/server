import {
  checkNames,
  checkPassword,
  RegistrationError,
  authPassport,
} from '../../utils/auth-utils'
import {
  LowRecaptchaScoreError,
  MissingRecaptchaTokenError,
} from '../../models/Errors'
import * as RecaptchaService from '../../services/RecaptchaService'
import { RecaptchaScoreResponse } from '../../services/RecaptchaService'
import { mocked } from 'ts-jest/utils'
import logger from '../../logger'

const mockedRecaptchaService = mocked(RecaptchaService, true)

describe('name validator', () => {
  test('accepts two valid names', async () => {
    expect(checkNames('Somebodys', 'Name')).toBeUndefined()
  })
  test('accepts names with spaces', async () => {
    expect(checkNames('Name With', 'Spaces')).toBeUndefined()
  })
  test('accepts names with hyphens', async () => {
    expect(checkNames('Name', 'Hyphenated-Surname')).toBeUndefined()
  })
  test('rejects a valid first name and URL last name', async () => {
    expect(() => {
      checkNames('Somebodys', 'https://bit.ly')
    }).toThrow()
  })
  test('rejects a URL first name and valid last name', async () => {
    expect(() => {
      checkNames('https://bit.ly', 'Name')
    }).toThrow()
  })
  test('rejects a URL mixed in with other text in at least one name', async () => {
    expect(() => {
      checkNames('Congratulations! Visit https://bit.ly!', 'Name')
    }).toThrow()
  })
})

describe('password validator', () => {
  test('password must be at least 8 characters long', async () => {
    expect(() => {
      checkPassword('abcDE67')
    }).toThrow(new RegistrationError('Password must be 8 characters or longer'))
  })

  test('password must contain a number', async () => {
    expect(() => {
      checkPassword('a-B-c-D-')
    }).toThrow(
      new RegistrationError('Password must contain at least one number')
    )
  })

  test('password must contain a lowercase letter', async () => {
    expect(() => {
      checkPassword('ABC--456')
    }).toThrow(
      new RegistrationError(
        'Password must contain at least one lowercase letter'
      )
    )
  })

  test('password must contain an uppercase letter', async () => {
    expect(() => {
      checkPassword('abc--456')
    }).toThrow(
      new RegistrationError(
        'Password must contain at least one uppercase letter'
      )
    )
  })

  test('valid password', async () => {
    expect(checkPassword('abcdABCD1234!@#$')).toBe(true)
  })
})

describe('authPassport', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockedRecaptchaService.Score = jest.fn().mockResolvedValue({
      data: {
        success: true,
        score: 1.0,
        action: 'sendVerification',
      },
    } as RecaptchaScoreResponse)
  })

  describe('checkRecaptcha', () => {
    const testMiddleware = async (
      strict: boolean,
      req: any,
      res: any,
      next: any
    ) => {
      const handler: (
        req: any,
        res: any,
        next: any
      ) => Promise<void> = authPassport.checkRecaptcha(strict)
      await handler(req, res, next)
      return { req, res, next }
    }

    it('Should fail if the token is not present while strict=true', async () => {
      const results = await testMiddleware(
        true,
        { headers: [] },
        jest.fn(),
        jest.fn()
      )
      expect(logger.error).toHaveBeenCalledWith(
        'unable to check grecaptcha: no token in request headers'
      )
      expect(results.next).toHaveBeenCalledWith(
        new MissingRecaptchaTokenError()
      )
    })

    it('Should NOT fail if the token is not present while strict=false', async () => {
      const results = await testMiddleware(
        false,
        { headers: [] },
        jest.fn(),
        jest.fn()
      )
      expect(logger.error).not.toHaveBeenCalled()
      expect(results.next).toHaveBeenCalledWith()
    })

    it.each([false, true])(
      'Should fail if the token is present but the scoring request failed, regardless of param strict (%s)',
      async strict => {
        mockedRecaptchaService.Score = jest.fn().mockResolvedValue({
          data: {
            success: false,
            score: 0.0,
            action: 'sendVerification',
          },
        } as RecaptchaScoreResponse)
        const results = await testMiddleware(
          strict,
          {
            headers: {
              'g-recaptcha-response': 'testToken',
            },
          },
          jest.fn(),
          jest.fn()
        )
        expect(logger.error).toHaveBeenCalledWith(
          expect.stringContaining('grecaptcha result failed')
        )
        expect(results.next).toHaveBeenCalledWith(
          expect.objectContaining({
            message:
              'Something went wrong. Please contact the UPchieve team at support@upchieve.org for help.',
          })
        )
      }
    )

    it('Should fail if the score is below threshold for requests with strict=true', async () => {
      mockedRecaptchaService.Score = jest.fn().mockResolvedValue({
        data: {
          success: true,
          score: 0.1,
          action: 'sendVerification',
        },
      } as RecaptchaScoreResponse)
      const results = await testMiddleware(
        true,
        { headers: { 'g-recaptcha-response': 'testToken' } },
        jest.fn(),
        jest.fn()
      )
      expect(logger.info).toHaveBeenCalledWith(
        'grecaptcha result 0.1 for sendVerification'
      )
      expect(results.next).toHaveBeenCalledWith(new LowRecaptchaScoreError())
    })

    it('Should NOT fail if the score is below threshold for requests with strict=false', async () => {
      mockedRecaptchaService.Score = jest.fn().mockResolvedValue({
        data: {
          success: true,
          score: 0.1,
          action: 'sendVerification',
        },
      } as RecaptchaScoreResponse)
      const results = await testMiddleware(
        false,
        { headers: { 'g-recaptcha-response': 'testToken' } },
        jest.fn(),
        jest.fn()
      )
      expect(logger.info).toHaveBeenCalledWith(
        'grecaptcha result 0.1 for sendVerification'
      )
      expect(results.next).toHaveBeenCalledWith()
    })
  })
})
