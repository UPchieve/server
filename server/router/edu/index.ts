import express from 'express'
// TODO: no typesfor ejs layouts
const expressLayouts = require('express-ejs-layouts')

import config from '../../config'
import { authPassport } from '../../utils/auth-utils'
import * as QuestionCtrl from '../../controllers/QuestionCtrl'
import { questionsPath, isActivePage, frontEndPath } from './helpers'
import logger from '../../logger'
import path from 'path'
import { asString } from '../../utils/type-utils'
import * as QuestionRepo from '../../models/Question'

const edu = express()
edu.set('view engine', 'ejs')
edu.set('views', path.join(__dirname, '../../views'))
edu.set('layout', 'layouts/edu')
edu.use(expressLayouts)
edu.locals = {
  homeLink: config.NODE_ENV === 'dev' ? 'http://localhost:3000' : '/',
  frontEndRoot:
    config.NODE_ENV === 'dev' ? new URL('http://localhost:3000') : null,
}

// GET /edu
edu.get('/', async (req, res) => {
  try {
    const categories = (await QuestionCtrl.categories()).reduce(
      (acc: any, [category, subcategories]) => [
        ...acc,
        questionsPath(category),
        subcategories.map((subcategory: string) =>
          questionsPath(category, subcategory)
        ),
      ],
      []
    )

    res.render('edu/index', {
      adminPages: [
        { path: 'questions', label: 'All Questions' },
        ...categories,
      ],
      isActive: isActivePage(req),
    })
  } catch (error) {
    logger.error(error as Error)
    res.status(500).send(`<h1>Internal Server Error</h1> <pre>${error}</pre>`)
  }
})

// GET /edu/questions
edu.route('/questions').get(async (req, res) => {
  try {
    const questions = await QuestionCtrl.list(req.query || {})
    const isActive = isActivePage(req)

    // question._id --> URL
    const imagePaths = questions.reduce((map: any, question) => {
      map[question.id] = frontEndPath(
        question.imageSrc || '',
        edu.locals.frontEndRoot
      )
      return map
    }, {})

    res.render('edu/questions/index', {
      questions,
      isActive,
      imagePaths,
      csrfToken: req.csrfToken(),
    })
  } catch (error) {
    res.status(500).send(`<h1>Internal Server Error</h1> <pre>${error}</pre>`)
  }
})

// GET /edu/questions/new
edu.route('/questions/new').get((req, res) => {
  const question = {
    possibleAnswers: [{ val: 'a' }, { val: 'b' }, { val: 'c' }, { val: 'd' }],
  }
  const isActive = isActivePage(req)
  res.render('edu/questions/new', {
    question,
    isActive,
    csrfToken: req.csrfToken(),
  })
})

const eduApi = express()

// POST[JSON] /edu/categoryquestions
eduApi.post('/categoryquestions', async (req, res) => {
  const category = asString(req.body.category)

  // TODO: duck typing on optionals here
  const skip = req.body.skip

  const limit = req.body.limit

  try {
    const questions = await QuestionRepo.getQuestionsByCategory(
      category,
      limit,
      skip
    )
    res.status(200).json({ questions: questions })
  } catch (error) {
    res.status(422).json({ error: (error as Error).toString() })
  }
})

// POST[JSON] /edu/questions
eduApi.post('/questions', async (req, res) => {
  try {
    const question = await QuestionCtrl.create(req.body.question)
    res.status(200).json({ question: question })
  } catch (error) {
    res.status(422).json({ error })
  }
})

// PUT[JSON] /edu/questions/:id
eduApi.put('/questions/:id', async (req, res) => {
  try {
    const updatedQuestion = await QuestionCtrl.update({
      id: Number(req.params.id),
      question: req.body.question,
    })
    res.status(200).json({ question: updatedQuestion })
  } catch (error) {
    res.status(422).json({ error })
  }
})

// DELETE[JSON] /edu/questions/:id
eduApi.delete('/questions/:id', async (req, res) => {
  try {
    await QuestionCtrl.destroyQuestion(Number(req.params.id))
    res.status(200).json({ id: req.params.id })
  } catch (error) {
    res.status(422).json({ error })
  }
})

export function routes(rootApp: express.Express): void {
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
