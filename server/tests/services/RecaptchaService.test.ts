import { validateRequestRecaptcha } from '../../services/RecaptchaService'
import {
  LowRecaptchaScoreError,
  MissingRecaptchaTokenError,
} from '../../models/Errors'
import axios from 'axios'

jest.mock('axios')
describe('RecaptchaService', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    const axiosPostMock = axios.post as jest.Mock
    axiosPostMock.mockResolvedValue({
      data: {
        score: 1.0,
        success: true,
        action: 'testAction',
      },
    })
  })

  it('Successfully passes validations', async () => {
    await validateRequestRecaptcha({
      headers: {
        'g-recaptcha-response': 'testToken',
      },
    } as any)
  })

  it('Should throw a MissingRecaptchaTokenError if the token is not present', async () => {
    await expect(() =>
      validateRequestRecaptcha({ headers: {} } as any)
    ).rejects.toThrow(MissingRecaptchaTokenError)
  })

  it('Should throw an error if the score cannot be retrieved', async () => {
    const axiosPostMock = axios.post as jest.Mock
    axiosPostMock.mockResolvedValue({
      data: {
        success: false,
      },
    })
    await expect(() =>
      validateRequestRecaptcha({
        headers: {
          'g-recaptcha-response': 'testToken',
        },
      } as any)
    ).rejects.toThrow('Could not get recaptcha score for request')
  })

  it('Should throw a LowRecaptchaScoreError if the score is below threshold', async () => {
    const axiosPostMock = axios.post as jest.Mock
    axiosPostMock.mockResolvedValue({
      data: {
        score: 0.0,
        action: 'testAction',
        success: true,
      },
    })
    await expect(() =>
      validateRequestRecaptcha({
        headers: {
          'g-recaptcha-response': 'testToken',
        },
      } as any)
    ).rejects.toThrow(LowRecaptchaScoreError)
  })
})
