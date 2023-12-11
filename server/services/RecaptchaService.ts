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
export async function getScore(token: string): Promise<RecaptchaScoreResponse> {
  return axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${config.googleRecaptchaSecret}&response=${token}`
  )
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

  const result = await getScore(token as string)
  if (!result.data || !result.data?.success) {
    logger.error(`grecaptcha result failed: ${JSON.stringify(result.data)}`)
    throw new Error('Could not get recaptcha score for request')
  }
  logger.info(
    `grecaptcha result ${result.data.score} for ${result.data.action}`
  )

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
