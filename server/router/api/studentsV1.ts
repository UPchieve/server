import expressWs from 'express-ws'
import express from 'express'
import { getSessionsByStudentId } from '../../services/SessionService'
import { LoadedRequest } from '../app'
import { resError } from '../res-error'

const prefix = '/v1/students'

export default function(router: expressWs.Router): void {
  router.get(prefix + '/recent-subjects', async function(
    req: LoadedRequest,
    res: express.Response
  ) {
    try {
      const sessions = await getSessionsByStudentId(req.user._id, 3)
      res.status(200).json({ sessions: sessions })
    } catch (err) {
      resError(res, err)
    }
  })
}
