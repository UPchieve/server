import { Express, Router } from 'express'
import type { Request, Response } from 'express'
import twilio from 'twilio'
import config from '../../config'
import logger from '../../logger'
import * as UserService from '../../services/UserService'
import * as UserProfileService from '../../services/UserProfileService'

export function routes(app: Express): void {
  const router = Router()

  router.post('/incoming-sms', async function (req, res) {
    try {
      await ensureValidTwilioRequest(req, 'incoming-sms')

      const { From: phoneNumber, OptOutType: optOutType } = req.body

      if (!phoneNumber) {
        logger.warn('No phone number provided in Twilio webhook.')
        return sendEmptyTwimlResponse(res)
      }

      if (optOutType === 'START' || optOutType === 'STOP') {
        const hasGivenConsent = optOutType === 'START'
        const userId = await UserService.getUserIdByPhone(phoneNumber)

        if (!userId) {
          logger.warn(
            { phoneNumber },
            `Unable to update opt-in/out user: No user found with phone number.`
          )
          return sendEmptyTwimlResponse(res)
        }

        await UserProfileService.updateUserSmsConsent(userId, hasGivenConsent)
        logger.info(
          {
            hasGivenConsent,
            userId,
          },
          `Updated sms_consent for user.`
        )
      }

      sendEmptyTwimlResponse(res)
    } catch (err) {
      logger.error(err, 'Error processing opt-out webhook.')
      sendEmptyTwimlResponse(res)
    }
  })

  app.use('/api-public/twiml', router)
}

async function ensureValidTwilioRequest(req: Request, routeName: string) {
  const twilioSignature = req.headers['x-twilio-signature'] as string
  const url = `${config.protocol}://${config.host}/api-public/twiml/${routeName}`

  const isValid = twilio.validateRequest(
    config.authToken,
    twilioSignature,
    url,
    req.body
  )

  if (!isValid) {
    throw new Error('Invalid Twilio signature for webhook request.')
  }
}

function sendEmptyTwimlResponse(res: Response) {
  const twiml = new twilio.twiml.MessagingResponse()
  res.type('text/xml').send(twiml.toString())
}
