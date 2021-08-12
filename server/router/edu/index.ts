import express, { Express, Request, Response } from 'express'
const expressLayouts = require('express-ejs-layouts')

import config from '../../config'
import { authPassport } from '../../utils/auth-utils'
import QuestionModel, { Question } from '../../models/Question'
import * as QuestionCtrl from '../../controllers/QuestionCtrl'
import { questionsPath, isActivePage, frontEndPath } from './helpers'
import logger from '../../logger'
import path from 'path'

const edu = express()
edu.set('view engine', 'ejs')
edu.set('views', path.join(__dirname, '../../views'))
edu.set('layout', 'layouts/edu')
edu.use(expressLayouts)
edu.locals = {
  homeLink: config.NODE_ENV === 'dev' ? 'http://localhost:3000' : '/',
  frontEndRoot:
    config.NODE_ENV === 'dev' ? new URL('http://localhost:3000') : null
}

// GET /edu
edu.get('/', async (req: Request, res: Response) => {
  try {
    const categories = (await QuestionCtrl.categories()).reduce(
      (acc, [category, subcategories]) => [
        ...acc,
        questionsPath(category),
        subcategories.map((subcategory: string) => questionsPath(category, subcategory))
      ],
      []
    )

    res.render('edu/index', {
      adminPages: [
        { path: 'questions', label: 'All Questions' },
        ...categories
      ],
      isActive: isActivePage(req)
    })
  } catch (error) {
    logger.error(error)
    res.status(500).send(`<h1>Internal Server Error</h1> <pre>${error}</pre>`)
  }
})

// GET /edu/questions
edu.route('/questions').get(async (req: Request, res: Response) => {
  try {
    const questions = await QuestionCtrl.list(req.query as any || {})
    const isActive = isActivePage(req)

    // question._id --> URL
    const imagePaths = questions.reduce((map: {}, question: Question) => {
      map[question._id] = frontEndPath(
        question.imageSrc,
        edu.locals.frontEndRoot
      )
      return map
    }, {})

    res.render('edu/questions/index', { questions, isActive, imagePaths })
  } catch (error) {
    res.status(500).send(`<h1>Internal Server Error</h1> <pre>${error}</pre>`)
  }
})

// GET /edu/questions/new
edu.route('/questions/new').get((req: Request, res: Response) => {
  const question = {
    possibleAnswers: [{ val: 'a' }, { val: 'b' }, { val: 'c' }, { val: 'd' }]
  }
  const isActive = isActivePage(req)
  res.render('edu/questions/new', { question, isActive })
})

const eduApi = express()

// POST[JSON] /edu/categoryquestions
eduApi.post('/categoryquestions', async (req: Request, res: Response) => {
  const category = req.body.category.toString()

  const skip = req.body.skip

  const limit = req.body.limit

  try {
    const questions = await QuestionModel.find({ category }, null, {
      skip,
      limit
    }).exec()
    res.status(200).json({ questions: questions })
  } catch (error) {
    res.status(422).json({ error: error.toString() })
  }
})

// POST[JSON] /edu/questions
eduApi.post('/questions', async (req: Request, res: Response) => {
  try {
    const question = await QuestionCtrl.create(req.body.question)
    res.status(200).json({ question: question })
  } catch (error) {
    res.status(422).json({ error })
  }
})

// PUT[JSON] /edu/questions/:id
eduApi.put('/questions/:id', async (req: Request, res: Response) => {
  try {
    const updatedQuestion = await QuestionCtrl.update({
      id: req.params.id,
      question: req.body.question
    })
    res.status(200).json({ question: updatedQuestion })
  } catch (error) {
    res.status(422).json({ error })
  }
})

// DELETE[JSON] /edu/questions/:id
eduApi.delete('/questions/:id', async (req: Request, res: Response) => {
  try {
    const question = await QuestionCtrl.destroy(req.params.id)
    res.status(200).json({ question: question })
  } catch (error) {
    res.status(422).json({ error })
  }
})

export default function (rootApp: Express) {
  rootApp.use(
    '/edu',
    [authPassport.isAuthenticatedRedirect, authPassport.isAdminRedirect],
    edu
  )
  rootApp.use(
    '/edu',
    [authPassport.isAuthenticated, authPassport.isAdmin],
    eduApi
  )
}
