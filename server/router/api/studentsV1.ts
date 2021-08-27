import expressWs from '@small-tech/express-ws'
import express from 'express'
import { getMostRecentSessionSubTopics } from '../../services/StudentService'
import { authPassport } from '../../utils/auth-utils'
import { UserNotFoundError } from '../../models/Errors'

const prefix = '/v1/students'

export default function(router: expressWs.Router): void {
  router.get(
    prefix + '/:id/recent-subjects',
    authPassport.isAuthenticated,
    async function(
      req: express.Request,
      res: express.Response,
      next: Function
    ) {
      const id = req.params.id
      if (id.length < 2) {
        res.status(422).json({ err: 'no student id found' })
        next()
        return
      }
      try {
        const sessionTypes = await getMostRecentSessionSubTopics(id, 3)
        res.status(200).json({ types: sessionTypes })
      } catch (err) {
        if (err instanceof UserNotFoundError) {
          res.status(400).json({ err: 'student id not found' })
        } else {
          res.status(500).json({ err: 'unexpected server error' })
        }
      }
      next()
    }
  )
}
