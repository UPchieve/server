import Sentry from '@sentry/node'
import * as TrainingCtrl from '../../controllers/TrainingCtrl'
import * as UserActionCtrl from '../../controllers/UserActionCtrl'
import * as TrainingCourseService from '../../services/TrainingCourseService'
import * as VolunteerService from '../../services/VolunteerService'
import { Router } from 'express'
import { asString } from '../../utils/type-utils'
import { resError } from '../res-error'
import { extractUser } from '../extract-user'
import {
  Volunteer,
  Certifications,
  TrainingCourses,
} from '../../models/Volunteer'
import { userHasTakenQuiz } from '../../models/UserAction/queries'

export function routeTraining(router: Router): void {
  router.post('/training/questions', async function(req, res) {
    try {
      const questions = await TrainingCtrl.getQuestions(
        asString(req.body.category)
      )
      res.json({
        msg: 'Questions retrieved from database',
        questions: questions,
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/training/score', async function(req, res) {
    try {
      const { ip } = req
      const user = extractUser(req)

      const category = asString(req.body.category)
      const idAnswerMap = req.body.idAnswerMap // TODO: duck type validation

      const {
        tries,
        passed,
        score,
        idCorrectAnswerMap,
      } = await TrainingCtrl.getQuizScore({
        user: user as Volunteer,
        ip,
        category: category as keyof Certifications,
        idAnswerMap,
      })

      const quizActionCreator = new UserActionCtrl.QuizActionCreator(
        user._id,
        category as keyof Certifications,
        ip
      )
      if (passed) {
        quizActionCreator
          .passedQuiz()
          .catch(error => Sentry.captureException(error))
      } else {
        // we want to queue a job to send this email only if this is the first time
        // a volunteer has taken a quiz ever, and they failed it
        // must come before th quizActionCreator call or will never fire
        // because there would always be a failed quiz
        const takenQuizBefore = await userHasTakenQuiz(user._id)
        if (!takenQuizBefore)
          await VolunteerService.queueFailedFirstAttemptedQuizEmail(
            category,
            user.email,
            user.firstname,
            user._id
          )
        quizActionCreator
          .failedQuiz()
          .catch(error => Sentry.captureException(error))
      }

      res.json({
        msg: 'Score calculated and saved',
        tries,
        passed,
        score,
        idCorrectAnswerMap,
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/training/review/:category', function(req, res) {
    try {
      const user = extractUser(req)
      const category = asString(req.params.category)
      const { ip: ipAddress } = req

      new UserActionCtrl.QuizActionCreator(
        user._id,
        category as keyof Certifications,
        ipAddress
      )
        .viewedMaterials()
        .catch(error => Sentry.captureException(error))

      res.sendStatus(204)
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/training/course/:courseKey', function(req, res) {
    try {
      const user = extractUser(req)
      const courseKey = asString(req.params.courseKey)
      const course = TrainingCourseService.getCourse(
        user as Volunteer,
        courseKey as keyof TrainingCourses
      )
      if (!course) return res.sendStatus(404)
      res.status(200).json({ course })
    } catch (err) {
      resError(res, err)
    }
  })

  router.post('/training/course/:courseKey/progress', async function(req, res) {
    try {
      const user = extractUser(req)
      const courseKey = asString(req.params.courseKey)
      const materialKey = asString(req.body.materialKey)
      const result = await TrainingCourseService.recordProgress(
        user as Volunteer,
        courseKey as keyof TrainingCourses,
        materialKey
      )
      if (result)
        // TODO: can I exit early?
        res.status(200).json(result)
    } catch (err) {
      resError(res, err)
    }
  })
}
