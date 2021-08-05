import admin from 'firebase-admin'
import config from '../../config'
import { Express, Request, Response } from 'express'

export default function(app: Express) {
  if (process.env.FIREBASE_PRIVATE_KEY_JSON) {
    admin.initializeApp({
      projectId: config.firebase.projectId,
      credential: admin.credential.cert(
        JSON.parse(process.env.FIREBASE_PRIVATE_KEY_JSON)
      )
    })
  }

  // used in native app to workaround iOS 3rd party cookie limitation
  app.use('/setcookie', function(req: Request, res: Response) {
    res.cookie('mobile_cookie', '1', { maxAge: 3600 * 24 * 365 * 10 })
    res.redirect(302, 'http://localhost:12380?redirected')
  })
}
