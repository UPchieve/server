import { Express } from 'express'
import config from '../config'
import { ContactFormService } from '../services/ContactFormService'
import { ContactFormRouter } from './contact'

export default function(app: Express, contactFormSvc: ContactFormService) {
  console.log('Initializing server routing')

  const contactFormRouter = new ContactFormRouter(contactFormSvc)

  require('./whiteboard')(app)

  const sessionStore = require('./auth/session-store')(app)

  require('./auth')(app)
  require('./api')(app, sessionStore)
  require('./edu')(app)
  require('./eligibility')(app)
  require('./twiml')(app)
  contactFormRouter.routes(app)
  require('./metrics')(app)
  require('./mobile')(app)
  require('./reference')(app)
  require('./referral')(app)

  app.get('/healthz', function(req, res) {
    res.status(200).json({ version: config.version })
  })
}
