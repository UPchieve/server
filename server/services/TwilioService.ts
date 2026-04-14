import twilio from 'twilio'
import config from '../config'
import logger from '../logger'
import { VERIFICATION_METHOD } from '../constants'
import * as UserProfileService from './UserProfileService'

const twilioClient =
  config.accountSid && config.authToken
    ? twilio(config.accountSid, config.authToken)
    : null

// See Twilio Verify error codes here: https://www.twilio.com/docs/api/errors#6-anchor
enum TwilioErrorCodes {
  INVALID_PARAMETER = 60200,
}

export async function sendTextMessage(
  phoneNumber: string,
  messageText: string,
  sessionId?: string
): Promise<string | undefined> {
  try {
    logger.info(
      { sessionId },
      `Sending text message "${messageText}" to ${phoneNumber}`
    )

    // If stored phone number doesn't have international calling code (E.164 formatting)
    // then default to US number.
    // TODO: Normalize previously stored US phone numbers.
    const fullPhoneNumber =
      phoneNumber[0] === '+' ? phoneNumber : `+1${phoneNumber}`

    if (!twilioClient) {
      logger.warn('Twilio client not loaded.')
      return
    }

    const message = await twilioClient.messages.create({
      to: fullPhoneNumber,
      from: config.twilioMessageServiceId,
      body: messageText,
    })
    return message.sid
  } catch (err) {
    if (
      (err as Error).message === 'Attempt to send to unsubscribed recipient'
    ) {
      await UserProfileService.optOutSmsConsentForPhoneNumber(phoneNumber)
    }
    logger.error(err, 'An expected error happened while sending a text message')
  }
}

export async function sendVerification(
  sendTo: string,
  verificationMethod: VERIFICATION_METHOD,
  firstName: string,
  userId: string
): Promise<void> {
  if (!twilioClient) {
    logger.warn('Twilio client not loaded.')
    return
  }

  await twilioClient.verify.v2
    .services(config.twilioAccountVerificationServiceSid)
    .verifications.create(
      {
        to: sendTo,
        channel: verificationMethod,
        channelConfiguration: {
          from: config.mail.senders.noreply,
          from_name: 'UPchieve',
          substitutions: {
            firstName,
          },
        },
        rateLimits: {
          [config.twilioVerificationRateLimitUniqueName]: userId,
        },
      },
      async (error, verificationInstance) => {
        if (error) {
          if (
            'code' in error &&
            error['code'] === TwilioErrorCodes.INVALID_PARAMETER
          ) {
            // Rate limit with that unique name does not exist.
            // This should have been created during application startup.
            logger.warn(
              `Could not find Twilio rate limit with uniqueName=${config.twilioVerificationRateLimitUniqueName} while attempting to send a verification code. Will attempt to create it now.`
            )
            await createRateLimit(config.twilioVerificationRateLimitUniqueName)
          }
        }
      }
    )
}

export async function confirmVerification(
  to: string,
  code: string
): Promise<boolean> {
  if (!twilioClient) {
    logger.warn('Twilio client not loaded.')
    return true
  }
  const result = await twilioClient.verify.v2
    .services(config.twilioAccountVerificationServiceSid)
    .verificationChecks.create({ to, code })
  return result.valid
}

/**
 * Verifies that the Twilio RateLimit resource with the desired uniqueName exists,
 * or creates it if not.
 *
 * The RateLimit is identified by its uniqueName attribute when you
 * make a createVerification request.
 *
 * Each RateLimit has 1 or more associated RateLimitBucket resources which
 * is where we configure the actual time interval and number of retries.
 *
 * Learn more here: https://www.twilio.com/docs/verify/api/programmable-rate-limits
 */
export async function fetchOrCreateRateLimit() {
  if (!twilioClient) {
    logger.warn('Twilio client not loaded')
    return
  }

  logger.info(
    `Attempting to fetch or create Twilio rate limit with uniqueName=${config.twilioVerificationRateLimitUniqueName}`
  )

  // Fetch RateLimits and see if the one we want exists.
  const rateLimits = await twilioClient.verify.v2
    .services(config.twilioAccountVerificationServiceSid)
    .rateLimits.list()

  const targetRateLimit = rateLimits.find(
    (rateLimit) =>
      rateLimit.uniqueName === config.twilioVerificationRateLimitUniqueName
  )
  if (targetRateLimit) {
    return
  }
  logger.warn(
    `Did not find Twilio rate limit resource with name ${config.twilioVerificationRateLimitUniqueName}. Will create one now.`
  )
  await createRateLimit(config.twilioVerificationRateLimitUniqueName)
}

async function createRateLimit(uniqueName: string): Promise<void> {
  // Create RateLimit
  const rateLimit = await twilioClient?.verify.v2
    .services(config.twilioAccountVerificationServiceSid)
    .rateLimits.create({
      uniqueName,
      description: `Rate limit on ${uniqueName}`,
    })
  if (!rateLimit) {
    // It should throw an error in this case, but just to be safe
    throw new Error(`Could not create rate limit`)
  }

  logger.info(`Created RateLimit in Twilio with uniqueName=${uniqueName}`)
  const rateLimitSid = (await Promise.resolve(rateLimit)).sid

  // Create RateLimitBucket
  const rateLimitBucket = await twilioClient?.verify.v2
    .services(config.twilioAccountVerificationServiceSid)
    .rateLimits(rateLimitSid)
    .buckets.create({
      max: config.twilioVerificationRateLimitMaxRetries,
      interval: config.twilioVerificationRateLimitIntervalSeconds,
    })

  if (!rateLimitBucket) {
    // It should throw an error in this case, but just to be safe
    throw new Error('Could not create rate limit bucket')
  }
  logger.info(`Created RateLimitBucket in Twilio`)
}
