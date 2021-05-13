import session from 'express-session'
import connectMongo from 'connect-mongo'
import config from '../../config'

const MongoStore = connectMongo(session)

export default function(app) {
  const sessionStore = new MongoStore({
    url: config.database,
    collection: 'auth-sessions'
  })

  app.use(
    session({
      resave: true,
      saveUninitialized: true,
      secret: config.sessionSecret,
      store: sessionStore,
      cookie: {
        httpOnly: false,
        maxAge: config.sessionCookieMaxAge
      }
    })
  )

  return sessionStore
}
