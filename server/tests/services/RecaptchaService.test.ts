import { validateRequestRecaptcha } from '../../services/RecaptchaService'
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

  it('Should return true if successfully passes validations', async () => {
    const result = await validateRequestRecaptcha({
      headers: {
        'g-recaptcha-response': 'testToken',
      },
    } as any)
    expect(result).toBe(true)
  })

  it('Should return false if the token is not present', async () => {
    const result = await validateRequestRecaptcha({ headers: {} } as any)
    expect(result).toBe(false)
  })

  it('Should return false if the score cannot be retrieved', async () => {
    const axiosPostMock = axios.post as jest.Mock
    axiosPostMock.mockResolvedValue({
      data: {
        success: false,
      },
    })
    const result = await validateRequestRecaptcha({
      headers: {
        'g-recaptcha-response': 'testToken',
      },
    } as any)
    expect(result).toBe(false)
  })

  it('Should return false if the score is below threshold', async () => {
    const axiosPostMock = axios.post as jest.Mock
    axiosPostMock.mockResolvedValue({
      data: {
        score: 0.0,
        action: 'testAction',
        success: true,
      },
    })
    const result = await validateRequestRecaptcha({
      headers: {
        'g-recaptcha-response': 'testToken',
      },
    } as any)
    expect(result).toBe(false)
  })
})
