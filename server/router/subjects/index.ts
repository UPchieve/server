import { resError } from '../res-error'
import express, { Express, Router } from 'express'
import { getSubjectsWithTopic } from '../../models/Subjects'
import { authPassport } from '../../utils/auth-utils'

export function routes(app: Express): void {
  const router: Router = express.Router()

  router.get('/subjects', async function(_, res) {
    try {
      const subjects = await getSubjectsWithTopic()
      res.json({
        subjects,
      })
    } catch (err) {
      resError(res, err)
    }
  })

  app.use('/api-public', authPassport.checkRecaptcha, router)
}
