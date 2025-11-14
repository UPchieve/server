import { Express } from 'express'
import passport from 'passport'
import config from '../config'
import logger, { logError } from '../logger'
import { authPassport } from '../utils/auth-utils'
import SessionStore from './api/session-store'
import * as ContactFormRouter from './contact'
import * as AuthRouter from './auth'
import * as ApiRouter from './api'
import * as ApiPublicRouter from './api-public'
import * as EligibilityRouter from './eligibility'
import * as WhiteboardRouter from './whiteboard'
import * as MobileRouter from './mobile'
import * as ReferenceRouter from './reference'
import * as ReferralRouter from './referral'
import * as SubjectsRouter from './subjects'
import * as TwimlRouter from './twiml'
import { Server } from 'socket.io'
import { v4 as uuidv4 } from 'uuid'
import { getAllFlagsForId } from '../services/FeatureFlagService'
import { addPassportAuthMiddleware } from './auth/passport-auth-middleware'
import { extractUserIfExists } from './extract-user'
import { getPersonPropertiesForAnalytics } from '../services/AnalyticsService'
import QueueService from '../services/QueueService'
import { Jobs } from '../worker/jobs'

export default function (app: Express, io: Server) {
  logger.info('initializing server routing')

  // Initialize session store.
  const sessionMiddleware = SessionStore(app)

  // Initialize passport AFTER session store (https://stackoverflow.com/a/30882574).
  authPassport.setupPassport()
  addPassportAuthMiddleware()
  app.use(passport.initialize())
  app.use(passport.session())

  WhiteboardRouter.routes(app)
  AuthRouter.routes(app)
  ApiRouter.routes(app, sessionMiddleware, io)
  ApiPublicRouter.routes(app)
  EligibilityRouter.routes(app)
  TwimlRouter.routes(app)
  ContactFormRouter.routes(app)
  MobileRouter.routes(app)
  ReferenceRouter.routes(app)
  ReferralRouter.routes(app)
  SubjectsRouter.routes(app)

  app.get('/healthz', function (_req, res) {
    res.status(200).json({ version: config.version })
  })

  app.get('/api-public/feature-flags', async function (req, res) {
    const user = extractUserIfExists(req)
    const phCookie = req.cookies[`ph_${config.posthogToken}_posthog`]
    const distinctId = phCookie ? JSON.parse(phCookie).distinct_id : uuidv4()
    try {
      const personProperties = await getPersonPropertiesForAnalytics(user?.id)
      const flags: {
        featureFlags: Record<string, boolean | string>
        featureFlagPayloads: Record<string, unknown>
      } = await getAllFlagsForId(distinctId, personProperties)
      res.status(200).json({ id: distinctId, ...flags, personProperties })
    } catch (e) {
      logError(new Error(`Failed to bootstrap feature flags. ${e}`), {
        userId: distinctId,
      })
      res.status(200).json({ id: distinctId })
    }
  })
}
