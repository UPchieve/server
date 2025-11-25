import express from 'express'
import { asString } from '../../utils/type-utils'
import { resError } from '../res-error'
import * as NTHSGroupsService from '../../services/NTHSGroupsService'

export function routes(app: express.Express): void {
  const router = express.Router()

  router.get('/:inviteCode/invitation', async function (req, res) {
    try {
      const inviteCode = asString(req.params.inviteCode)
      const NTHSgroup =
        await NTHSGroupsService.getNTHSGroupByInviteCode(inviteCode)
      res.json({ NTHSgroup })
    } catch (err) {
      resError(res, err)
    }
  })

  app.use('/api-public/nths-group-invite', router)
}
