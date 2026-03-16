import { mocked } from 'jest-mock'
import {
  checkNames,
  checkEmail,
  checkPassword,
  RegistrationError,
  authPassport,
} from '../../utils/auth-utils'
import {
  InputError,
  LowRecaptchaScoreError,
  MissingRecaptchaTokenError,
  NotAllowedError,
} from '../../models/Errors'
import * as RecaptchaService from '../../services/RecaptchaService'
import * as EmailDomainBlocklist from '../../models/EmailDomainBlocklist'

jest.mock('../../services/RecaptchaService')
jest.mock('../../models/EmailDomainBlocklist')
const mockedEmailDomainBlocklist = mocked(EmailDomainBlocklist)

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

describe('email validator', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  test('accepts a valid email', async () => {
    mockedEmailDomainBlocklist.getEmailDomainBlocklistEntry.mockResolvedValue(
      undefined
    )
    await expect(checkEmail('user@gmail.com')).resolves.not.toThrow()
  })

  test('rejects an invalid email format (InputError)', async () => {
    await expect(checkEmail('not-an-email')).rejects.toThrow(InputError)
  })

  test('rejects a disposable email (NotAllowedError)', async () => {
    mockedEmailDomainBlocklist.getEmailDomainBlocklistEntry.mockResolvedValue({
      id: 123,
      domain: 'mailshan.com',
    })
    await expect(checkEmail('user@mailshan.com')).rejects.toThrow(
      NotAllowedError
    )
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
  })

  describe('checkRecaptcha', () => {
    it('Should call next() if the request passes recaptcha validations', async () => {
      const req = {
        headers: {
          'g-recaptcha-response': 'testToken',
        },
      } as any
      const res = {} as any
      const nextMock = jest.fn()

      await authPassport.checkRecaptcha(req, res, nextMock)
      expect(nextMock).toHaveBeenCalled()
    })

    it.each([
      new LowRecaptchaScoreError(),
      new MissingRecaptchaTokenError(),
      new Error('Test'),
    ])(
      'Should not call next() if the request fails recaptcha validations due to %s',
      async (err) => {
        ;(
          RecaptchaService.validateRequestRecaptcha as jest.Mock
        ).mockRejectedValue(err)
        const req = {
          headers: {
            'g-recaptcha-response': 'testToken',
          },
        } as any
        const mockRes = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        }
        const nextMock = jest.fn()
        await authPassport.checkRecaptcha(req, mockRes as any, nextMock)
        expect(nextMock).not.toHaveBeenCalled()
        expect(mockRes.status).toHaveBeenCalledWith(500)
      }
    )
  })
})
