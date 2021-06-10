import { Request, Response } from 'express'
import { captureException } from '@sentry/node'
import {
  AccountActionCreator,
  QuizActionCreator
} from '../controllers/UserActionCtrl'

export function addUserAction(
  req: Request,
  res: Response,
  next: Function
): void {
  if (Object.prototype.hasOwnProperty.call(req, 'user')) {
    const { _id } = req.user
    const { ip: ipAddress } = req

    if (req.url === '/api/calendar/save') {
      new AccountActionCreator(_id, ipAddress)
        .updatedAvailability()
        .catch(error => captureException(error))
    }

    if (req.url === '/api/training/questions') {
      const { category } = req.body
      new QuizActionCreator(_id, category, ipAddress)
        .startedQuiz()
        .catch(error => captureException(error))
    }

    // add user action 'updated profile' only from /profile request route
    const referer = req.headers.referer
    if (
      req.url === '/api/user' &&
      req.method === 'PUT' &&
      referer.includes('profile')
    ) {
      new AccountActionCreator(_id, ipAddress)
        .updatedProfile()
        .catch(error => captureException(error))
    }
  }

  next()
}
