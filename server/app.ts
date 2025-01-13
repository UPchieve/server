import * as http from 'http'
import { Socket } from 'net'
import timeout from 'connect-timeout'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, {
  json,
  NextFunction,
  Request,
  Response,
  urlencoded,
} from 'express'
import cacheControl from 'express-cache-controller'
import expressWs from 'express-ws'
import fs from 'fs'
import swaggerUi from 'swagger-ui-express'
import { promisify } from 'util'
import YAML from 'yaml'
import config from './config'
import logger from './logger'
import pinoHttp from 'pino-http'
import router from './router'
import socketServer from './socket-server'
import { fetchOrCreateRateLimit } from './services/TwilioService'
import { isDevEnvironment } from './utils/environments'
import { Server as Engine } from 'engine.io'

function haltOnTimedout(req: Request, res: Response, next: NextFunction) {
  if (!req.timedout) next()
  else {
    logger.error(
      {
        reqId: req.id,
        userId: req.user?.id,
        method: req.method,
        path: req.path,
        url: req.url,
        originalUrl: req.originalUrl,
      },
      'Request timed out'
    )
  }
}

// Express App
const app = express()

/**
 * @note: must typecast many handlers with express.RequestHandler
 * due to @types/node >=15.9.x and @types/express <14.7.1
 * see https://github.com/expressjs/express/issues/4618
 */

// TODO: Uncomment once we can use newrelic again.
// app.use(
//   pinoHttp({
//     logger,
//   }) as express.RequestHandler
// )

app.use(timeout('300000'))

/**
 * Account for nginx proxy when getting client's IP address
 * http://expressjs.com/en/guide/behind-proxies.html
 */
app.set('trust proxy', true)

// Setup middleware
app.use(json() as express.RequestHandler)
app.use(urlencoded({ extended: true }) as express.RequestHandler)

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
    wss.handleUpgrade(request, socket as Socket, head, ws => {
      wss.emit('connection', ws, request)
    })
  }
})
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
