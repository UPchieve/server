import session from 'express-session'
import CreatePgStore from 'connect-pg-simple'
import config from '../../config'
import { getClient } from '../../db'
import { isProductionEnvironment } from '../../utils/environments'

const PgStore = CreatePgStore(session)
const sessionMiddleware = session({
  resave: false,
  saveUninitialized: false,
  secret: config.sessionSecret,
  store: new PgStore({
    pool: getClient(),
    schemaName: 'auth',
    tableName: 'session',
  }),
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProductionEnvironment(),
    maxAge: config.sessionCookieMaxAge,
  },
})

export default sessionMiddleware
