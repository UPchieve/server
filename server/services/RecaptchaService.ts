import axios from 'axios'
import config from '../config'

export interface RecaptchaScoreResponse {
  data: {
    success: boolean
    score: number
    action: string
    errorCodes?: string[]
  }
}

/**
 * Get the Recaptcha score for the request with the given token
 * @param token
 * @constructor
 */
export async function scoreAction(
  token: string
): Promise<RecaptchaScoreResponse> {
  return axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${config.googleRecaptchaSecret}&response=${token}`
  )
}
