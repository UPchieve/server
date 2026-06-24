import axios from 'axios'
import config from '../config'
import { Request } from 'express'
import logger from '../logger'

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
export async function validateRequestRecaptcha(req: Request): Promise<boolean> {
  if (
    config.loadTestKey &&
    req.headers['x-load-test-key'] === config.loadTestKey
  ) {
    return true
  }
  try {
    const token = req.headers['g-recaptcha-response']
    if (!token) {
      logger.info(
        { userId: req.user?.id },
        'unable to check grecaptcha: no token in request headers'
      )
      return false
    }

    const result = await getScore(token as string, req.ip)
    // TODO: Check action as well?
    if (!result.data || !result.data?.success) {
      logger.error(
        { data: JSON.stringify(result.data), userId: req.user?.id },
        `failed to get grecaptcha score`
      )
      return false
    }

    const logMetadata = {
      score: result.data.score,
      action: result.data.action,
      threshold: config.googleRecaptchaThreshold,
      userId: req.user?.id,
      verificationMethod: req.body?.data?.verificationMethod,
    }

    if (result.data.score < config.googleRecaptchaThreshold) {
      logger.warn(logMetadata, `grecaptcha score is below threshold`)
      return false
    }

    logger.info(logMetadata, 'grecaptcha score passes threshold')
    return true
  } catch (err) {
    logger.error(
      { userId: req.user?.id, err },
      'unexpected error in grecaptcha validation'
    )
    return false
  }
}
