import { Express } from 'express'
import passport from 'passport'
import config from '../config'
import logger from '../logger'
import { authPassport } from '../utils/auth-utils'
import SessionStore from './api/session-store'
import * as ContactFormRouter from './contact'
import * as AuthRouter from './auth'
import * as ApiRouter from './api'
import * as EligibilityRouter from './eligibility'
import * as WhiteboardRouter from './whiteboard'
import * as EduRouter from './edu'
import * as MobileRouter from './mobile'
import * as ReferenceRouter from './reference'
import * as ReferralRouter from './referral'
import * as SubjectsRouter from './subjects'
import * as TwimlRouter from './twiml'
import { Server } from 'socket.io'

export default function(app: Express, io: Server) {
  logger.info('initializing server routing')

  // initialize session store
  const sessionStore = SessionStore(app)

  // initialize passport AFTER session store (https://stackoverflow.com/a/30882574)
  authPassport.setupPassport()
  app.use(passport.initialize())
  app.use(passport.session())

  WhiteboardRouter.routes(app)
  AuthRouter.routes(app)
  ApiRouter.routes(app, sessionStore, io)
  EduRouter.routes(app)
  EligibilityRouter.routes(app)
  TwimlRouter.routes(app)
  ContactFormRouter.routes(app)
  MobileRouter.routes(app)
  ReferenceRouter.routes(app)
  ReferralRouter.routes(app)
  SubjectsRouter.routes(app)

  app.get('/healthz', function(req, res) {
    res.status(200).json({ version: config.version })
  })
}
