import session from 'express-session'
import CreateRedisStore from 'connect-redis'
import config from '../../config'
import { Express } from 'express'
import Redis from 'ioredis'

const RedisStore = CreateRedisStore(session)

export const sessionStoreCollectionName = 'auth-sessions'

export default function(app: Express) {
  const store = new RedisStore({ client: new Redis(config.redisConnectionString) })
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
