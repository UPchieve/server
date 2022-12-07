import { resError } from '../res-error'
import { Router } from 'express'
import { topics, trainingView, FEATURE_FLAGS } from '../../constants'
import { isValidSubjectAndTopic } from '../../services/SubjectsService'
import { isEnabled } from 'unleash-client'
import {
  getSubjectsWithTopic,
  getVolunteerTrainingData,
} from '../../models/Subjects'

export function routeSubjects(router: Router): void {
  router.get('/subjects', async function(req, res) {
    try {
      if (isEnabled(FEATURE_FLAGS.SUBJECTS_DATABASE_HYDRATION)) {
        const subjects = await getSubjectsWithTopic()
        res.json({
          subjects: subjects,
        })
      } else {
        // remove below in subjects-database-hydration flag cleanup
        res.json({
          subjects: topics,
        })
      }
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/subjects/training', async function(req, res) {
    try {
      if (isEnabled(FEATURE_FLAGS.TRAINING_VIEW_DATABASE_HYDRATION)) {
        const trainingView = await getVolunteerTrainingData()
        res.json({
          training: trainingView,
        })
      } else {
        // remove below in training-view-database-hydration flag cleanup
        res.json({
          training: trainingView,
        })
      }
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
