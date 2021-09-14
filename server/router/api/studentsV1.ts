import expressWs from '@small-tech/express-ws'
import express from 'express'
import logger from '../../logger'
import { getMostRecentSessionInfo } from '../../services/StudentService'
import { authPassport } from '../../utils/auth-utils'
import { resError } from '../res-error'

const prefix = '/v1/students'

export default function(router: expressWs.Router): void {
  router.get(
    prefix + '/recent-subjects',
    authPassport.isAuthenticated,
    async function(
      req: express.Request,
      res: express.Response,
      next: Function
    ) {
      const id = req.user._id.toString()
      if (id.length < 2) {
        res.status(422).json({ err: 'no student id found' })
        next()
        return
      }
      try {
        const sessions = await getMostRecentSessionInfo(id, 3)
        logger.debug(`Got sessions: ${sessions}`)
        res.status(200).json({ sessions: sessions })
      } catch (err) {
        resError(res, err)
      }
    }
  )
}
