import { Express, Request, Response, Router } from 'express'
import {
  ContactFormDataValidationError, MailSendError, saveContactFormSubmission
} from '../../services/ContactFormService'
import { DocCreationError, UserNotFoundError } from '../../models/Errors'

function submissionHandler(req: Request, res: Response) {
  const requestData = req.body as unknown

  return saveContactFormSubmission(requestData)
    .then(() => {
      res.status(200).json({
        msg: 'contact form submission has been sent'
      })
    }).catch((err: ContactFormDataValidationError
      | UserNotFoundError
      | DocCreationError
      | MailSendError) => {
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
    })
}

export function routes(app: Express) {
  const router = new Router()

  router.route('/send').post(submissionHandler)

  app.use('/api-public/contact', router)
}
