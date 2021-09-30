import express from 'express'
import bodyParser from 'body-parser'
import { Server } from 'socket.io'

import { Student } from '../models/Student'
import { Volunteer } from '../models/Volunteer'
import { LoadedRequest } from '../router/app'
import socketServer from '../router/api/socket-server'

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
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(defaultErrorHandler)

  return app
}

export function mockPassportMiddleware(getUser: () => Student | Volunteer) {
  return (
    req: LoadedRequest,
    res: express.Response,
    next: express.NextFunction
    ): void => {
    req.user = getUser()
    req.login = jest.fn()
    // @ts-ignore: mocking an express session
    req.session = {
      destroy: jest.fn()
    }
    next()
  }
}

export function mockRouter() {
  return express.Router()
}

export function mockSocketServer(app: express.Express): Server {
  return socketServer(app)
}