import { Express, Router } from 'express'
import {
  ContactFormDataValidationError,
  ContactFormService
} from '../../services/ContactFormService'
import { DocCreationError, UserNotFoundError } from '../../models/Errors'

export class ContactFormRouter {
  svc: ContactFormService

  constructor(svc: ContactFormService) {
    this.svc = svc
  }

  routes(app: Express) {
    const router = new Router()
    const svc = this.svc

    router.route('/send').post(function(req, res) {
      const requestData = req.body as unknown

      return svc
        .saveContactFormSubmission(requestData)
        .then(() => {
          const mailData = {
            email: requestData.email,
            message: requestData.message,
            topic: requestData.topic
          }
          return svc.sendContactForm(mailData, function(err) {
            if (err) {
              res.status(500).json({
                error:
                  'failed to send contact form submission through email provider'
              })
            } else {
              res.status(200).json({
                msg: 'contact form submission has been sent'
              })
            }
          })
        })
        .catch(
          (
            err:
              | ContactFormDataValidationError
              | UserNotFoundError
              | DocCreationError
          ) => {
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

    app.use('/api-public/contact', router)
  }
}
