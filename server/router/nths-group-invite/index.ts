import express, { type Response } from 'express'
import { asString } from '../../utils/type-utils'
import { resError } from '../res-error'
import * as NTHSGroupsService from '../../services/NTHSGroupsService'
import { toNTHSGroupJoinPublic } from '../../public/nths'
import type { NTHSInviteCodeInvitationResponse } from '../../contracts/api-public'

export function routes(app: express.Express): void {
  const router = express.Router()

  router.get(
    '/:inviteCode/invitation',
    async function (req, res: Response<NTHSInviteCodeInvitationResponse>) {
      try {
        const inviteCode = asString(req.params.inviteCode)
        const NTHSgroup =
          await NTHSGroupsService.getNTHSGroupByInviteCode(inviteCode)
        res.json({
          NTHSgroup: NTHSgroup ? toNTHSGroupJoinPublic(NTHSgroup) : null,
        })
      } catch (err) {
        resError(res, err)
      }
    }
  )

  app.use('/api-public/nths-group-invite', router)
}
