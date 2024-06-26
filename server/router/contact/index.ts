import { Express, Request, Response, Router } from 'express'
import nr from 'newrelic'
import { saveContactFormSubmission } from '../../services/ContactFormService'
import { RepoCreateError } from '../../models/Errors'
import logger from '../../logger'

async function submissionHandler(req: Request, res: Response) {
  const requestData = req.body as unknown

  logger.debug(requestData as any)
  await nr.startSegment(
    'router:contactFormSubmission:save',
    true,
    async function() {
      try {
        await saveContactFormSubmission(requestData)
        res.status(200).json({
          message: 'contact form submission has been sent',
        })
      } catch (err) {
        logger.error(err as Error)
        if (err instanceof RepoCreateError) {
          res.status(400).json({
            error: (err as Error).message,
          })
        } else {
          res.status(500).json({
            error: (err as Error).message,
          })
        }
      }
    }
  )
}

export function routes(app: Express) {
  const router = Router()

  router.route('/send').post(submissionHandler)

  app.use('/api-public/contact', router)
}
