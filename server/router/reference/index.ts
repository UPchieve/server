import { Express, Router } from 'express'
import * as UserService from '../../services/UserService'
import { getVolunteerByReference } from '../../models/Volunteer/queries'
import { asUlid } from '../../utils/type-utils'
import { resError } from '../res-error'

export function routes(app: Express): void {
  const router = Router()

  router.post('/:referenceId/submit', async (req, res) => {
    try {
      const referenceId = asUlid(req.params.referenceId)
      const { body: referenceFormData, ip } = req
      const result = await getVolunteerByReference(referenceId)
      if (!result) return res.sendStatus(404)
      const { volunteerId, referenceEmail } = result

      await UserService.saveReferenceForm(
        volunteerId,
        referenceId,
        referenceEmail,
        referenceFormData as unknown,
        ip
      )
      res.sendStatus(200)
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/:referenceId', async (req, res) => {
    try {
      const referenceId = asUlid(req.params.referenceId)
      const result = await getVolunteerByReference(referenceId)
      if (!result) return res.sendStatus(404)
      res.sendStatus(200)
    } catch (err) {
      resError(res, err)
    }
  })

  app.use('/api-public/reference', router)
}
