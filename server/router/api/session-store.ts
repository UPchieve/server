import session from 'express-session'
import CreatePgStore from 'connect-pg-simple'
import config from '../../config'
import { Express } from 'express'
import { getClient } from '../../db'

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

  return store
}
