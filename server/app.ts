import * as http from 'http'
import { Socket } from 'net'
import timeout from 'connect-timeout'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { Server as Engine } from 'engine.io'
import express, { json, NextFunction, Request, Response } from 'express'
import passport from 'passport'
import cacheControl from 'express-cache-controller'
import expressWs from 'express-ws'
import fs from 'fs'
import swaggerUi from 'swagger-ui-express'
import { promisify } from 'util'
import YAML from 'yaml'
import config from './config'
import logger, { pinoLogger } from './logger'
import pinoHttp from 'pino-http'
import router from './router'
import socketServer from './socket-server'
import { fetchOrCreateRateLimit } from './services/TwilioService'
import { isDevEnvironment } from './utils/environments'
import { HttpError } from './models/Errors'
import { authPassport } from './utils/auth-utils'
import { addPassportAuthMiddleware } from './router/auth/passport-auth-middleware'
import sessionMiddleware from './router/middleware/session'
import { getUuid } from './models/pgUtils'

const app = express()

// TODO: Figure out how much we should sample so we don't run into
// NR data ingestion limits.
// TODO: Update pino-http.
app.use(
  pinoHttp({
    logger: pinoLogger,
  })
)

app.use(timeout(config.requestTimeout))

/**
 * Account for our proxies when getting the client's IP address.
 * Setting `trust proxy` to true means Express will return
 * the leftmost IP in X-Forwarded-For header when we access `req.ip`.
 * For more information, see:
 * http://expressjs.com/en/guide/behind-proxies.html
 */
app.set('trust proxy', true)

app.use(json() as express.RequestHandler)
app.use(cookieParser(config.sessionSecret))

app.use(
  cors({
    origin: `${config.protocol}://${config.host}`,
    credentials: true,
  })
)

/*
 * Since we do not use `<form>` elements to submit data, we can simply rely on adding a
 * custom header to force preflight on cross-origin requests for CSRF protection.
 *
 * If the header is present, an OPTIONS request is sent for cross-origin requests,
 * which verifies CORS compliance (i.e. rejects any cross-origin traffic not specified in
 * our CORS config).
 * If the header is not present, we can simply reject the request as potential forgery.
 *
 * Only state-changing methods (POST, PUT, PATCH, DELETE) require CSRF protection.
 * Safe methods (GET, HEAD, OPTIONS) are exempt per OWASP guidelines.
 *
 * See https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#employing-custom-request-headers-for-ajaxapi
 * for more information.
 */
app.use((req, _res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS']
  if (safeMethods.includes(req.method) || req.headers['x-csrf-token']) {
    next()
  } else {
    const error = new HttpError('Missing CSRF token.', 403)
    next(error)
  }
})
// TODO: Remove once midtown is no longer calling this route.
// Just add any value on the client instead. See above comment.
app.get('/api/csrftoken', (_req, res) => {
  return res.json({ csrfToken: getUuid() })
})

// for now, send directive to never cache to prevent Zwibbler issues
// until we figure out a caching strategy
app.use(
  cacheControl({
    noCache: true,
  })
)

// Initialize session store.
app.use(sessionMiddleware)
// Initialize passport AFTER session store (https://stackoverflow.com/a/30882574).
authPassport.setupPassport()
addPassportAuthMiddleware()
app.use(passport.initialize())
app.use(passport.session())

// see https://stackoverflow.com/questions/51023943/nodejs-getting-username-of-logged-in-user-within-route
app.use((req, res, next) => {
  res.locals.user = req.user || null
  next()
})

// Make req.login async
app.use((req, res, next): void => {
  // Wrapper around promise to allow for no callback when using with await
  req.asyncLogin = (arg1: Express.User, arg2?: any) =>
    promisify(req.login.bind(req))(arg1)
  next()
})

// Swagger docs
if (isDevEnvironment()) {
  const swaggerDoc = fs.readFileSync(
    `${__dirname}/swagger/swagger.yaml`,
    'utf8'
  )
  const swaggerYaml = YAML.parse(swaggerDoc)
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerYaml))
}

export const server = http.createServer(app)
// Initialize Express WebSockets.
const wsInstance = expressWs(app, server)
// Initialize socket-io.
export const io = socketServer(server)
// Manually upgrade the WebSocket and socket.io connections.
server.removeAllListeners('upgrade')
server.on('upgrade', (request, socket, head) => {
  const pathname = request.url
  if (pathname?.startsWith('/socket.io/')) {
    // Temporary workaround for `handleUpgrade` not existing on the type: https://github.com/socketio/socket.io/issues/4693#issuecomment-1529401350
    ;(io.engine as Engine).handleUpgrade(request, socket, head)
  } else {
    const wss = wsInstance.getWss()
    wss.handleUpgrade(request, socket as Socket, head, (ws) => {
      wss.emit('connection', ws, request)
    })
  }
})

// Load server router.
router(app, io)

// Send error responses to requests after logging.
app.use((err: HttpError, req: Request, res: Response, _next: NextFunction) => {
  if (req.timedout) {
    err.httpStatus = 504
  }
  logger.error(
    {
      reqId: req.id,
      userId: req.user?.id,
      method: req.method,
      path: req.path,
      url: req.url,
      originalUrl: req.originalUrl,
    },
    err.message ?? 'An error occurred'
  )
  // Attaching the error to the response means the error will be correctly
  // logged on the request by pino (instead of a generic error).
  res.err = err
  res.status(err.httpStatus || 500).json({ err: err.message || err })
})

fetchOrCreateRateLimit()
  .then(() => {
    logger.info('Successfully loaded Twilio rate limit')
  })
  .catch((error) => {
    logger.warn(
      `Error occurred while attempting to fetch or create Twilio rate limit`,
      error.message
    )
  })

export default app
