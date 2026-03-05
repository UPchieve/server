import axios from 'axios'
import config from '../config'
import { Request } from 'express'
import logger from '../logger'
import {
  LowRecaptchaScoreError,
  MissingRecaptchaTokenError,
} from '../models/Errors'

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
export async function getScore(
  token: string,
  ip?: string
): Promise<RecaptchaScoreResponse> {
  const params = new URLSearchParams()
  params.append('secret', config.googleRecaptchaSecret)
  params.append('response', token)
  if (ip) {
    params.append('remoteip', ip)
  }
  const res = (await axios.post(
    `https://www.google.com/recaptcha/api/siteverify`,
    params,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )) as any
  return { data: res.data }
}

/**
 * Validates the recaptcha score for the request, throwing errors if
 * any of the validations fail.
 * @throws MissingRecaptchaTokenError if the g-recaptcha-response header is missing
 * @throws LowRecaptchaScoreError if the score is below threshold
 * @throws Error
 * @param req
 */
export async function validateRequestRecaptcha(req: Request): Promise<void> {
  const token = req.headers['g-recaptcha-response']
  if (!token) {
    logger.info('unable to check grecaptcha: no token in request headers')
    throw new MissingRecaptchaTokenError()
  }

  const result = await getScore(token as string, req.ip)
  if (!result.data || !result.data?.success) {
    logger.error(
      { data: JSON.stringify(result.data) },
      `grecaptcha result failed`
    )
    throw new Error('Could not get recaptcha score for request')
  }

  if (result.data.score < config.googleRecaptchaThreshold) {
    logger.warn({
      message: `grecaptcha score is below threshold`,
      score: result.data.score,
      action: result.data.action,
      threshold: config.googleRecaptchaThreshold,
      userId: req.user?.id,
      verificationMethod: req.body?.data?.verificationMethod,
    })
    throw new LowRecaptchaScoreError()
  }
}
