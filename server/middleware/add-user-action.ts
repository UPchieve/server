import { Request, Response, NextFunction } from 'express'
import { captureException } from '@sentry/node'
import { extractUser } from '../router/extract-user'
import * as UserActionRepo from '../models/UserAction'
import { ACCOUNT_USER_ACTIONS, QUIZ_USER_ACTIONS } from '../constants'

export async function addUserAction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (Object.prototype.hasOwnProperty.call(req, 'user')) {
    const { id } = extractUser(req)
    const { ip: ipAddress } = req

    if (req.url === '/api/calendar/save') {
      try {
        await UserActionRepo.createAccountAction({
          action: ACCOUNT_USER_ACTIONS.UPDATED_AVAILABILITY,
          userId: id,
          ipAddress,
        })
      } catch (err) {
        captureException(err)
      }
    }

    if (req.url === '/api/training/questions') {
      const { category } = req.body
      try {
        await UserActionRepo.createQuizAction({
          action: QUIZ_USER_ACTIONS.STARTED,
          quizSubcategory: category,
          userId: id,
          ipAddress,
        })
      } catch (err) {
        captureException(err)
      }
    }

    if (req.url === '/api/user' && req.method === 'PUT') {
      try {
        await UserActionRepo.createAccountAction({
          action: ACCOUNT_USER_ACTIONS.UPDATED_PROFILE,
          userId: id,
          ipAddress,
        })
      } catch (err) {
        captureException(err)
      }
    }
  }

  next()
}
