import { Express } from 'express'
import config from '../config'
import * as ContactFormRouter from './contact'

export default function(app: Express) {
  console.log('Initializing server routing')

  require('./whiteboard')(app)

  const sessionStore = require('./auth/session-store')(app)

  require('./auth')(app)
  require('./api')(app, sessionStore)
  require('./edu')(app)
  require('./eligibility')(app)
  require('./twiml')(app)
  ContactFormRouter.routes(app)
  require('./metrics')(app)
  require('./mobile')(app)
  require('./reference')(app)
  require('./referral')(app)

  app.get('/healthz', function(req, res) {
    res.status(200).json({ version: config.version })
  })
}
