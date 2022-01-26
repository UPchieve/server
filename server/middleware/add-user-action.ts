import { Request, Response, NextFunction } from 'express'
import { captureException } from '@sentry/node'
import { Volunteer } from '../models/Volunteer'
import { Student } from '../models/Student'
import {
  AccountActionCreator,
  QuizActionCreator,
} from '../controllers/UserActionCtrl'

export async function addUserAction(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (Object.prototype.hasOwnProperty.call(req, 'user')) {
    const { _id } = req.user as Volunteer | Student
    const { ip: ipAddress } = req

    if (req.url === '/api/calendar/save') {
      await new AccountActionCreator(_id, ipAddress)
        .updatedAvailability()
        .catch(error => captureException(error))
    }

    if (req.url === '/api/training/questions') {
      const { category } = req.body
      await new QuizActionCreator(_id, category, ipAddress)
        .startedQuiz()
        .catch(error => captureException(error))
    }

    if (req.url === '/api/user' && req.method === 'PUT') {
      await new AccountActionCreator(_id, ipAddress)
        .updatedProfile()
        .catch(error => captureException(error))
    }
  }

  next()
}
