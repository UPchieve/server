import { Express, Router } from 'express'
import { MongoStore } from 'connect-mongo'
import expressWs from '@small-tech/express-ws'
import { Server } from 'socket.io'
import passport from '../auth/passport'
import addLastActivity from '../../middleware/add-last-activity'
import addUserAction from '../../middleware/add-user-action'
import socketServer from './socket-server'
import volunteers from './volunteers'
import user from './user'
import { routeVerify } from './verify'
import session from './session'
import calendar from './calendar'
import training from './training'
import { routeFeedback } from './feedback'
import sockets from './sockets'
import moderate from './moderate'
import pushToken from './push-token'
import { routeReports } from './reports'
import { routeSurvey } from './survey'

module.exports = function(app: Express, sessionStore: MongoStore): void {
  console.log('API module')

  const io: Server = socketServer(app)

  const router: expressWs.Router = Router()

  volunteers(router)
  user(router)
  routeVerify(router)
  session(router, io)
  calendar(router)
  training(router)
  routeFeedback(router)
  sockets(io, sessionStore)
  moderate(router)
  pushToken(router)
  routeReports(router)
  routeSurvey(router)

  app.use(addLastActivity)
  app.use(addUserAction)
  app.use('/api', passport.isAuthenticated, router)
}
