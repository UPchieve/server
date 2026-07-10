import { resError } from '../res-error'
import express, { Express, Router, Response } from 'express'
import { getSubjectsWithTopic } from '../../models/Subjects'
import { SubjectsResponse } from '../../contracts/subjects'

export function routes(app: Express): void {
  const router: Router = express.Router()

  router.get('/subjects', async function (_, res: Response<SubjectsResponse>) {
    try {
      const subjects = await getSubjectsWithTopic()
      res.json({
        subjects,
      })
    } catch (err) {
      resError(res, err)
    }
  })

  app.use('/api-public', router)
}
