import { Express, Router } from 'express'
import twilio from 'twilio'
import _ from 'lodash'

import config from '../../config'
import logger from '../../logger'
import * as twilioService from '../../services/TwilioService'
import { resError } from '../res-error'
import { createSessionAction } from '../../models/UserAction'
import { SESSION_USER_ACTIONS } from '../../constants'
import { getVolunteerForTextResponse } from '../../models/Volunteer'

export function routes(app: Express): void {
  const router = Router()

  // This route is called by Twilio to receive TwiML instructions for
  // voice calls. The Twilio API for voice calling requires that a URL be
  // specified to obtain the TwiML code it needs to generate the voice message.
  // In order to put our message content into a voice call we give Twilio
  // a URL pointing to our own server, which contains the message text encoded
  // in it. When the call is answered, Twilio sends a request to this
  // URL, and our server responds with TwiML containing the decoded message text
  // and the configured voice for the text-to-speech conversion.
  router.post('/message/:message', function(req, res) {
    try {
      const message = decodeURIComponent(req.params.message)
      logger.info('Making TwiML for voice message')

      const twiml = new twilio.twiml.VoiceResponse()

      twiml.say({ voice: config.voice }, message)

      res.type('text/xml')
      res.send(twiml.toString())
    } catch (err) {
      // TODO: should we bother replying to twilio?
      resError(res, err)
    }
  })

  /**
   * This route handles SMS messages sent to our Twilio numbers
   */
  router.post('/incoming-sms', async function(req, res, next) {
    const twiml = new twilio.twiml.MessagingResponse()

    // TODO: duck type validation
    const incomingMessage = req.body.Body
    const incomingPhoneNumber = req.body.From
    let session

    if (!incomingPhoneNumber)
      return res.status(422).json({ err: 'Error: Missing phone number' })

    /**
     * If a volunteer responds "Yes" to a text notification, send
     * them a link to the session that they were notified about.
     */
    const yesRegex = /\b(yes|yeah|yea|yess|yesss|ye|ya|yaa|yee|y|yeh|yah|sure)\b/gim
    const isYesMessage = !!incomingMessage.match(yesRegex)

    if (isYesMessage) {
      try {
        /**
         * 1. Find the user by their phone number
         * 2. Populate their most recent notification
         * 3. Populate that notification's session
         */
        session = await getVolunteerForTextResponse(incomingPhoneNumber)
        if (!session) {
          logger.error(
            `User not found for phone number: ${incomingMessage}. Not acknologing phone reply`
          )
          return
        }

        if (!session.sessionId) {
          // Handle: No session found
          twiml.message(
            'Error: No session found. You can try joining the session from the dashboard at app.upchieve.org'
          )
        } else if (session.volunteerJoinedAt) {
          // Handle: Different volunteer already joined
          twiml.message('A volunteer has already joined this session')
        } else if (session.endedAt) {
          // Handle: Student already ended the session
          twiml.message('The student has cancelled their help request')
        } else {
          // Handle: No issues, so send the session URL
          const sessionUrl = twilioService.getSessionUrl({
            subject: session.subject,
            topic: session.topic,
            id: session.sessionId,
          })
          twiml.message(sessionUrl)
        }
      } catch (err) {
        return next(err)
      }
    } else {
      // Handle: Unknown message intent
      twiml.message(
        "Hmm, I don't understand. Please send questions to contact@upchieve.org"
      )
    }

    res.writeHead(200, { 'Content-Type': 'text/xml' })
    res.end(twiml.toString())

    if (isYesMessage && session) {
      await createSessionAction({
        userId: session.volunteerId,
        sessionId: session.sessionId,
        action: SESSION_USER_ACTIONS.REPLIED_YES,
      })
    }
  })

  app.use('/twiml', router)
}
