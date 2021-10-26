import moment from 'moment'
import { Request, Response, NextFunction } from 'express'
import { Volunteer } from '../models/Volunteer'
import { Student } from '../models/Student'
import { updateUserLastActivityById } from '../models/User/queries'

export function addLastActivity(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (Object.prototype.hasOwnProperty.call(req, 'user')) {
    const { _id, lastActivityAt } = req.user as Volunteer | Student
    // Convert all times to UTC for consistency
    const today = moment().utc()
    const lastActivityMoment = moment(lastActivityAt).utc()
    if (today.isAfter(lastActivityMoment, 'day')) {
      updateUserLastActivityById(_id, today.toDate())
        .then(() => next())
        .catch((err: Error) => next(err))
    } else {
      next()
    }
  } else {
    next()
  }
}
