import { Express, Router } from 'express'
import * as UserService from '../../services/UserService'
import { getVolunteerByReference } from '../../models/Volunteer/queries'
import { asObjectId } from '../../utils/type-utils'
import { resError } from '../res-error'

export function routes(app: Express): void {
  const router = Router()

  router.post('/:referenceId/submit', async (req, res) => {
    try {
      const referenceId = asObjectId(req.params.referenceId)
      const { body: referenceFormData, ip } = req
      const volunteer = await getVolunteerByReference(referenceId)
      if (!volunteer) return res.sendStatus(404)

      const { references, _id: userId } = volunteer
      let referenceEmail: string | undefined
      for (const reference of references) {
        if (reference._id.equals(referenceId)) referenceEmail = reference.email
      }
      if (!referenceEmail) return res.sendStatus(404)
      await UserService.saveReferenceForm(
        userId,
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
      const referenceId = asObjectId(req.params.referenceId)
      const volunteer = await getVolunteerByReference(referenceId)
      if (!volunteer) return res.sendStatus(404)
      res.sendStatus(200)
    } catch (err) {
      resError(res, err)
    }
  })

  app.use('/api-public/reference', router)
}
