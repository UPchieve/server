import { resError } from '../res-error'
import { Router } from 'express'
import { isValidSubjectAndTopic } from '../../services/SubjectsService'
import {
  getSubjectsWithTopic,
  getVolunteerTrainingData,
} from '../../models/Subjects'

export function routeSubjects(router: Router): void {
  router.get('/subjects', async function(req, res) {
    try {
      const subjects = await getSubjectsWithTopic()
      res.json({
        subjects,
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/subjects/training', async function(req, res) {
    try {
      const trainingView = await getVolunteerTrainingData()
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
