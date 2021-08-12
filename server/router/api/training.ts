const Sentry = require('@sentry/node')
const TrainingCtrl = require('../../controllers/TrainingCtrl')
const UserActionCtrl = require('../../controllers/UserActionCtrl')
const TrainingCourseService = require('../../services/TrainingCourseService')
const UserActionService = require('../../services/UserActionService')
const VolunteerService = require('../../services/VolunteerService')
import { Request, Response, NextFunction, Router } from 'express'
import { Volunteer } from '../../models/Volunteer'
import { User } from '../../models/User'

export default function(router: Router) {
  router.post('/training/questions', async function(req: Request, res: Response, next: NextFunction) {
    try {
      const questions = await TrainingCtrl.getQuestions({
        category: req.body.category
      })
      res.json({
        msg: 'Questions retrieved from database',
        questions: questions
      })
    } catch (err) {
      next(err)
    }
  })

  router.post('/training/score', async function(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, ip } = req
      const { category, idAnswerMap } = req.body

      const {
        tries,
        passed,
        score,
        idCorrectAnswerMap
      } = await TrainingCtrl.getQuizScore({
        user: (user as Volunteer),
        idAnswerMap,
        category,
        ip
      })
      if (!user) {
        throw new Error('no user was found from getting quiz score')
      }

      const quizActionCreator = new UserActionCtrl.QuizActionCreator(
        (user as Volunteer)._id,
        category,
        ip
      )
      if (passed) {
        quizActionCreator
          .passedQuiz()
          .catch((error: Error) => Sentry.captureException(error))
      } else {
        // we want to queue a job to send this email only if this is the first time
        // a volunteer has taken a quiz ever, and they failed it
        // must come before the next quizActionCreator call or will never fire
        // because there would always be a failed quiz
        const takenQuizBefore = await UserActionService.userHasTakenQuiz(
          (user as Volunteer)._id
        )
        if (!takenQuizBefore)
          await VolunteerService.queueFailedFirstAttemptedQuizEmail(
            category,
            (user as Volunteer).email,
            (user as Volunteer).firstname,
            (user as Volunteer)._id.toString()
          )
        quizActionCreator
          .failedQuiz()
          .catch((error: Error) => Sentry.captureException(error))
      }

      res.json({
        msg: 'Score calculated and saved',
        tries,
        passed,
        score,
        idCorrectAnswerMap
      })
    } catch (err) {
      next(err)
    }
  })

  router.get('/training/review/:category', function(req: Request, res: Response, next: NextFunction) {
    const { _id } = req.user as User
    const { category } = req.params
    const { ip: ipAddress } = req

    new UserActionCtrl.QuizActionCreator(_id, category, ipAddress)
      .viewedMaterials()
      .catch((error: Error) => Sentry.captureException(error))

    res.sendStatus(204)
  })

  router.get('/training/course/:courseKey', function(req: Request, res: Response, next: NextFunction) {
    const { user } = req
    const { courseKey } = req.params
    const course = TrainingCourseService.getCourse(user, courseKey)
    if (!course) return res.sendStatus(404)
    res.status(200).json({ course })
  })

  router.post('/training/course/:courseKey/progress', async function(
    req: Request,
    res: Response
  ) {
    const { user } = req
    const { courseKey } = req.params
    const { materialKey } = req.body
    const { progress, isComplete } = await TrainingCourseService.recordProgress(
      user,
      courseKey,
      materialKey
    )
    res.status(200).json({ progress, isComplete })
  })
}
