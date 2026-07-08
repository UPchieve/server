import { resError } from '../res-error'
import type { Router, Response } from 'express'
import {
  getTopics,
  isValidSubjectAndTopic,
} from '../../services/SubjectsService'
import {
  getSubjectsWithTopic,
  getVolunteerTrainingData,
} from '../../models/Subjects'
import { toAllSubjectsPublic, toTrainingPublic } from '../../public/subjects'
import {
  IsValidSubjectResponse,
  SubjectsResponse,
  TopicsResponse,
  TrainingResponse,
} from '../../contracts/subjects'

export function routeSubjects(router: Router): void {
  router.get(
    '/subjects',
    async function (req, res: Response<SubjectsResponse>) {
      try {
        const subjects = await getSubjectsWithTopic()
        res.json({
          subjects: toAllSubjectsPublic(subjects),
        })
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.get(
    '/subjects/training',
    async function (req, res: Response<TrainingResponse>) {
      try {
        const trainingView = await getVolunteerTrainingData()
        res.json({
          training: toTrainingPublic(trainingView),
        })
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.get(
    '/subjects/is-valid',
    async function (req, res: Response<IsValidSubjectResponse>) {
      try {
        const isValid = await isValidSubjectAndTopic(req.query)
        res.json({ isValid })
      } catch (err) {
        resError(res, err)
      }
    }
  )

  router.get('/topics', async function (_req, res: Response<TopicsResponse>) {
    try {
      const topics = await getTopics()
      res.json({ topics })
    } catch (err) {
      resError(res, err)
    }
  })
}
