import { Express, Router } from 'express'
import twilio from 'twilio'

import config from '../../config'
import logger from '../../logger'
import { resError } from '../res-error'

export function routes(app: Express): void {
  const router = Router()

  // TODO: Is this used?
  // This route is called by Twilio to receive TwiML instructions for
  // voice calls. The Twilio API for voice calling requires that a URL be
  // specified to obtain the TwiML code it needs to generate the voice message.
  // In order to put our message content into a voice call we give Twilio
  // a URL pointing to our own server, which contains the message text encoded
  // in it. When the call is answered, Twilio sends a request to this
  // URL, and our server responds with TwiML containing the decoded message text
  // and the configured voice for the text-to-speech conversion.
  router.post('/message/:message', function (req, res) {
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

  app.use('/twiml', router)
}
