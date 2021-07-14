import { Express } from 'express'
import passport from 'passport'
import config from '../config'
import { authPassport } from '../utils/auth-utils'
import logger from '../logger'
import * as ContactFormRouter from './contact'
import SessionStore from './api/session-store'
import * as AuthRouter from './auth'
import * as ApiRouter from './api'
import * as EligibilityRouter from './eligibility'

export default function(app: Express) {
  logger.info('initializing server routing')

  // initialize session store
  const sessionStore = SessionStore(app)

  // initialize passport AFTER session store (https://stackoverflow.com/a/30882574)
  authPassport.setupPassport()
  app.use(passport.initialize())
  app.use(passport.session())

  require('./whiteboard')(app)

  AuthRouter.routes(app)
  ApiRouter.routes(app, sessionStore)
  require('./edu')(app)
  EligibilityRouter.routes(app)
  require('./twiml')(app)
  ContactFormRouter.routes(app)
  require('./metrics')(app)
  require('./mobile')(app)
  require('./reference')(app)
  require('./referral')(app)

  app.get('/healthz', function(req, res) {
    res.status(200).json({ version: config.version })
  })
}
