import session from 'express-session'
import CreateRedisStore from 'connect-redis'
import config from '../../config'
import { Express } from 'express'
import { redisClient } from '../../services/RedisService'

const RedisStore = CreateRedisStore(session)

export const sessionStoreCollectionName = 'auth-sessions'

export default function(app: Express) {
  const store = new RedisStore({ client: redisClient })
  app.use(
    session({
      resave: true,
      saveUninitialized: true,
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
