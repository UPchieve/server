import session from 'express-session'
import CreatePgStore from 'connect-pg-simple'
import config from '../../config'
import { Express } from 'express'
import { getClient } from '../../db'
import { csrfSync } from 'csrf-sync'
import { getApiKeyFromHeader } from '../../utils/auth-utils'

const PgStore = CreatePgStore(session)

export default function (app: Express) {
  const store = new PgStore({
    pool: getClient(),
    schemaName: 'auth',
    tableName: 'session',
  })
  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: config.sessionSecret,
      store: store,
      cookie: {
        httpOnly: false,
        maxAge: config.sessionCookieMaxAge,
      },
    })
  )

  // CSRF middleware - must be registered after session middleware
  const { generateToken, csrfSynchronisedProtection } = csrfSync()

  app.get('/api/csrftoken', (req, res) => {
    const csrfToken = generateToken(req)
    return res.json({ csrfToken })
  })

  app.use((req, res, next) => {
    const exclusions = [
      '/auth/login',
      '/auth/register',
      '/auth/reset',
      '/api-public/eligibility',
      '/api-public/contact',
      '/api-public/twiml',
      '/api/verify',
      '/api/session/current',
      '/api/session/latest',
    ]
    const apiKey = getApiKeyFromHeader(req)
    if (
      exclusions.some((ex) => req.url.indexOf(ex) !== -1) ||
      (apiKey && apiKey === config.subwayApiCredentials)
    ) {
      next()
    } else {
      csrfSynchronisedProtection(req, res, next)
    }
  })

  return store
}
