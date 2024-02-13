import session from 'express-session'
import CreatePgStore from 'connect-pg-simple'
import config from '../../config'
import { Express } from 'express'
import { getClient } from '../../db'
import { csrfSync } from 'csrf-sync'
import csurf from 'csurf'
import logger from '../../logger'

const PgStore = CreatePgStore(session)

export default function(app: Express) {
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
  const csurfProtection = csurf({ cookie: true })
  const { generateToken, isRequestValid } = csrfSync()

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
      // /verify ?
    ]
    if (exclusions.some(ex => req.url.indexOf(ex) !== -1)) {
      next()
    } else {
      // Migration:
      // First check the token against the new CSRF middleware.
      // If invalid, try against the old middleware.
      const isCsrfValid = isRequestValid(req)
      if (!isCsrfValid) {
        if (!req.session.csrfToken) {
          generateToken(req) // backfills token onto session
        }
        logger.debug(
          { userId: req.user?.id, reqPath: req.path },
          'Passed csrf token-protected request onto second CSRF check'
        )
        csurfProtection(req, res, next)
      } else {
        next()
      }
    }
  })

  return store
}
