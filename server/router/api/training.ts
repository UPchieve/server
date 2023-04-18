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
import { QUIZ_USER_ACTIONS, TRAINING } from '../../constants'
import { getQuizReviewMaterials } from '../../models/Question/queries'
import { client as phClient } from '../../posthog'
import { FEATURE_FLAGS } from '../../constants'

export function routeTraining(router: Router): void {
  router.post('/training/questions', async function(req, res) {
    try {
      const category = asString(req.body.category)
      const user = extractUser(req)
      const questions = await TrainingCtrl.getQuestions(category)

      const tiny101Questions = [
        'A student sends you a GoogleDoc link to review her essay. How should you respond?',
        'Why are questions a great coaching tool?',
        'Coach Olivia chats to Student Sam: "Great job solving that problem! You persevered using the formula we reviewed.',
        'You student, Aiko chats in: So you multiply 3(x) and 3(3). So you get 3x + 6',
        'Ang is working on solving complex equations but is struggling with order of operations, what should you say?',
        'Lixin is calling you negative names and drawing inappropriate images on the whiteboard. What is the appropriate action you should take?',
        'Sarah asks you to share your email so she can connect with you to get help later on. How should you respond?',
        `You've been working with Mateo for 30 minutes on 2 problems and he has 5 problems left. His homework is due in 10 minutes. He asks you if you could please provide answers just this one time. How should you respond?`,
        `You've just joined a session and John lets you know he's working on a timed exam. How should you respond?`,
        'Destiny requested help in Algebra 1 but is asking questions about basic multiplication. How should you respond?',
        'How can negative implicit biases show up in UPchieve tutoring?',
      ]

      const isTiny101Active =
        (await phClient.isFeatureEnabled(
          FEATURE_FLAGS.TINY_UPCHIEVE101,
          user.id
        )) && category === TRAINING.UPCHIEVE_101

      const tiny101Quiz = questions.filter(question => {
        return tiny101Questions.some(q => question.questionText.startsWith(q))
      })

      res.json({
        msg: 'Questions retrieved from database',
        questions: isTiny101Active ? tiny101Quiz : questions,
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
