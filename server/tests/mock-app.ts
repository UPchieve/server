import express, { json, urlencoded } from 'express'
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
  app.use(json() as express.RequestHandler)
  app.use(urlencoded({ extended: true }) as express.RequestHandler)
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
    // @ts-ignore
    req.asyncLogin = login || jest.fn()
    // @ts-ignore
    req.asyncLogout = logout || jest.fn()
    // @ts-ignore
    req.isAuthenticated = () => true
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
