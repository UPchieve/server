import { Express, Request, Response, Router } from 'express'
import nr from 'newrelic'
import {
  ContactFormDataValidationError,
  MailSendError,
  saveContactFormSubmission
} from '../../services/ContactFormService'
import { DocCreationError, UserNotFoundError } from '../../models/Errors'
import logger from '../../logger'

function submissionHandler(req: Request, res: Response) {
  const requestData = req.body as unknown

  logger.debug(requestData)
  return nr.startSegment('router:contactFormSubmission:save', true, function() {
    return saveContactFormSubmission(requestData)
      .then(() => {
        res.status(200).json({
          message: 'contact form submission has been sent'
        })
      })
      .catch(
        (
          err:
            | ContactFormDataValidationError
            | UserNotFoundError
            | DocCreationError
            | MailSendError
        ) => {
          logger.error(err)
          if (
            err instanceof ContactFormDataValidationError ||
            err instanceof UserNotFoundError
          ) {
            res.status(400).json({
              error: err.message
            })
          } else {
            res.status(500).json({
              error: err.message
            })
          }
        }
      )
  })
}

export function routes(app: Express) {
  const router = Router()

  router.route('/send').post(submissionHandler)

  app.use('/api-public/contact', router)
}
