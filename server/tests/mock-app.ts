import bodyParser from 'body-parser'
import express from 'express'
import { UserContactInfo } from '../models/User'

export function defaultErrorHandler(
  err: Error & { httpStatus: number },
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  res.status(err.httpStatus || 500).json({ err: err.message || err })
  next()
}

export function mockApp(): express.Express {
  const app = express()
  app.use(bodyParser.json() as express.RequestHandler)
  app.use(bodyParser.urlencoded({ extended: true }) as express.RequestHandler)
  app.use(defaultErrorHandler)

  return app
}

export function mockPassportMiddleware(
  getUser: () => UserContactInfo,
  login?: (arg1: Express.User, arg2?: any) => Promise<unknown>,
  logout?: () => void,
  destroy?: Function
) {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void => {
    req.user = getUser()
    req.asyncLogin = login || jest.fn()
    req.logout = logout || jest.fn()
    req.session = {
      // @ts-expect-error: mocking a partial express session
      destroy: destroy || jest.fn(),
    }
    next()
  }
}

export function mockRouter() {
  return express.Router()
}
