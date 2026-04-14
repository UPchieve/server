import { Express } from 'express'
import config from '../config'
import logger, { logError } from '../logger'
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
import { extractUserIfExists } from './extract-user'
import {
  getPersonPropertiesForAnalytics,
  getPersonPropertiesFromLegacyUser,
} from '../services/AnalyticsService'
import { getLegacyUserObject } from '../models/User/legacy-user'
import { parseUserFromLegacyObject } from '../services/UserService'
import * as UserProductFlagsRepo from '../models/UserProductFlags/queries'

export default function (app: Express, io: Server) {
  logger.info('initializing server routing')

  WhiteboardRouter.routes(app)
  AuthRouter.routes(app)
  ApiRouter.routes(app, io)
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

  app.get('/api-public/init', async function (req, res) {
    const user = extractUserIfExists(req)
    const phCookie = req.cookies[`ph_${config.posthogToken}_posthog`]
    const distinctId = phCookie ? JSON.parse(phCookie).distinct_id : uuidv4()
    try {
      if (user) {
        const legacyUser = await getLegacyUserObject(user.id)

        const [parsedUser, personProperties, productFlags] = await Promise.all([
          parseUserFromLegacyObject(legacyUser),
          getPersonPropertiesFromLegacyUser(legacyUser),
          UserProductFlagsRepo.getPublicUPFByUserId(user.id),
        ])

        const flags: {
          featureFlags: Record<string, boolean | string>
          featureFlagPayloads: Record<string, unknown>
        } = await getAllFlagsForId(distinctId, personProperties)

        return res.status(200).json({
          user: parsedUser,
          id: distinctId,
          ...flags,
          personProperties,
          flags: productFlags,
        })
      } else {
        const flags: {
          featureFlags: Record<string, boolean | string>
          featureFlagPayloads: Record<string, unknown>
        } = await getAllFlagsForId(
          distinctId,
          await getPersonPropertiesForAnalytics()
        )

        return res.status(200).json({ id: distinctId, ...flags })
      }
    } catch (e) {
      logError(new Error(`Failed to load init data. ${e}`), {
        userId: user?.id ?? distinctId,
      })
      res.status(200).json({ id: distinctId })
    }
  })
}
