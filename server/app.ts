import * as Sentry from '@sentry/node'
import bodyParser from 'body-parser'
import timeout from 'connect-timeout'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { NextFunction, Request, Response } from 'express'
import cacheControl from 'express-cache-controller'
import expressWs from 'express-ws'
import fs from 'fs'
import helmet from 'helmet'
import swaggerUi from 'swagger-ui-express'
import { promisify } from 'util'
import YAML from 'yaml'
import config from './config'
import logger from './logger'
import pinoHttp from 'pino-http'
import router from './router'
import socketServer from './socket-server'
import {
  baseUri,
  blockAllMixedContent,
  connectSrc,
  defaultSrc,
  fontSrc,
  imgSrc,
  objectSrc,
  scriptSrc,
  scriptSrcAttr,
  styleSrc,
  upgradeInsecureRequests,
} from './securitySettings'
import { fetchOrCreateRateLimit } from './services/TwilioService'
import { TwilioError } from './models/Errors'
const csrf = require('csurf')

function haltOnTimedout(req: Request, res: Response, next: NextFunction) {
  if (!req.timedout) next()
}

// Set up Sentry error tracking
Sentry.init({
  dsn: config.sentryDsn,
  environment: config.NODE_ENV,
  release: `uc-server@${config.version}`,
})

// Express App
const app = express()

/**
 * @note: must typecast many handlers with express.RequestHandler
 * due to @types/node >=15.9.x and @types/express <14.7.1
 * see https://github.com/helmetjs/helmet/issues/325
 * see https://github.com/expressjs/express/issues/4618
 */

app.use(
  pinoHttp({
    logger,
  }) as express.RequestHandler
)

app.use(timeout('300000'))

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        baseUri,
        blockAllMixedContent,
        connectSrc,
        defaultSrc,
        fontSrc,
        // frameAncestors,
        imgSrc,
        objectSrc,
        scriptSrc,
        scriptSrcAttr,
        styleSrc,
        upgradeInsecureRequests,
      },
    },
  }) as express.RequestHandler
)

/**
 * Account for nginx proxy when getting client's IP address
 * http://expressjs.com/en/guide/behind-proxies.html
 */
app.set('trust proxy', true)

// Setup middleware
app.use(Sentry.Handlers.requestHandler() as express.RequestHandler) // The Sentry request handler must be the first middleware on the app
app.use(bodyParser.json() as express.RequestHandler)
app.use(bodyParser.urlencoded({ extended: true }) as express.RequestHandler)
app.use(cookieParser(config.sessionSecret))

let originRegex
if (config.additionalAllowedOrigins !== '') {
  originRegex = new RegExp(
    `^(${config.host}|${config.additionalAllowedOrigins})$`
  )
} else {
  originRegex = new RegExp(`^(${config.host})$`)
}

app.use(
  cors({
    origin: originRegex,
    credentials: true,
    exposedHeaders: config.NODE_ENV === 'dev' ? ['Date'] : undefined,
  })
)
// for now, send directive to never cache to prevent Zwibbler issues
// until we figure out a caching strategy
app.use(
  cacheControl({
    noCache: true,
  })
)
app.use(haltOnTimedout)
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

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler)

// Swagger docs
const swaggerDoc = fs.readFileSync(`${__dirname}/swagger/swagger.yaml`, 'utf8')
const swaggerYaml = YAML.parse(swaggerDoc)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerYaml))

// Setting up csrf middleware
app.use(csrf({ cookie: true }))
app.get('/api/csrftoken', function(req, res) {
  res.json({ csrfToken: req.csrfToken() })
})

// CSRF error handler
app.use(function(err: any, req: Request, res: Response, next: NextFunction) {
  if (err.code !== 'EBADCSRFTOKEN') return next(err)

  logger.error(`CSRF Token Error: ${err}`)
  res.sendStatus(403)
})

// initialize Express WebSockets
expressWs(app)

// Start socket server
export const io = socketServer(app)

// Load server router
router(app, io)

app.use(haltOnTimedout)

function defaultErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(err)
  res.status(err.httpStatus || 500).json({ err: err.message || err })
  next()
}

// Send error responses to API requests after they are passed to Sentry
app.use(
  ['/api', '/auth', '/contact', '/school', '/twiml', '/whiteboard'],
  defaultErrorHandler,
  haltOnTimedout
)

app.use(haltOnTimedout)

fetchOrCreateRateLimit()
  .then(() => {
    logger.info('Successfully loaded Twilio rate limit')
  })
  .catch(error => {
    logger.warn(
      `Error occurred while attempting to fetch or create Twilio rate limit`,
      error.message
    )
  })

export default app
