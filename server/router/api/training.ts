import * as TrainingCtrl from '../../controllers/TrainingCtrl'
import * as TrainingCourseService from '../../services/TrainingCourseService'
import * as VolunteerService from '../../services/VolunteerService'
import { Router } from 'express'
import { asString } from '../../utils/type-utils'
import { resError } from '../res-error'
import { extractUser } from '../extract-user'
import { Certifications, TrainingCourses } from '../../models/Volunteer'
import {
  userHasTakenQuiz,
  createQuizAction,
} from '../../models/UserAction/queries'
import { QUIZ_USER_ACTIONS } from '../../constants'
import { getQuizReviewMaterials } from '../../models/Question/queries'

export function routeTraining(router: Router): void {
  router.post('/training/questions', async function(req, res) {
    try {
      const user = extractUser(req)
      const questions = await TrainingCtrl.getQuestions(
        asString(req.body.category),
        user.id
      )

      res.json({
        msg: 'Questions retrieved from database',
        questions,
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
        isTrainingSubject,
      } = await TrainingCtrl.getQuizScore({
        user: user,
        ip,
        category: category as keyof Certifications,
        idAnswerMap,
      })

      if (passed) {
        await createQuizAction({
          userId: user.id,
          action: QUIZ_USER_ACTIONS.PASSED,
          quizSubcategory: category,
          ipAddress: ip,
        })
      } else {
        // we want to queue a job to send this email only if this is the first time
        // a volunteer has taken a quiz ever, and they failed it
        // must come before th quizActionCreator call or will never fire
        // because there would always be a failed quiz
        const takenQuizBefore = await userHasTakenQuiz(user.id)
        if (!takenQuizBefore)
          await VolunteerService.queueFailedFirstAttemptedQuizEmail(
            category,
            user.email,
            user.firstName,
            user.id
          )
        await createQuizAction({
          userId: user.id,
          action: QUIZ_USER_ACTIONS.FAILED,
          quizSubcategory: category,
          ipAddress: ip,
        })
      }

      res.json({
        msg: 'Score calculated and saved',
        tries,
        passed,
        score,
        idCorrectAnswerMap,
        isTrainingSubject,
      })
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/training/review/:category', async function(req, res) {
    try {
      const user = extractUser(req)
      const category = asString(req.params.category)
      const { ip: ipAddress } = req

      createQuizAction({
        userId: user.id,
        action: QUIZ_USER_ACTIONS.VIEWED_MATERIALS,
        quizSubcategory: category,
        ipAddress: ipAddress,
      })

      const resultList = await getQuizReviewMaterials(category)
      if (resultList) {
        res.status(200).json(resultList)
      }
    } catch (err) {
      resError(res, err)
    }
  })

  router.get('/training/course/:courseKey', async function(req, res) {
    try {
      const user = extractUser(req)
      const courseKey = asString(req.params.courseKey)
      const course = await TrainingCourseService.getCourse(
        user,
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
        user,
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
