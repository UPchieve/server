import { resError } from '../res-error'
import { Router } from 'express'
import { topics, trainingView } from '../../constants'
import { isValidSubjectAndTopic } from '../../services/SubjectsService'

export function routeSubjects(router: Router): void {
  router.get('/subjects', async function(req, res) {
    try {
      res.json({
        subjects: topics,
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/subjects/training', async function(req, res) {
    try {
      res.json({
        training: trainingView,
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/subjects/is-valid', async function(req, res) {
    try {
      const isValid = await isValidSubjectAndTopic(req.query)
      res.json({ isValid })
    } catch (err) {
      resError(res, err)
    }
  })
}
