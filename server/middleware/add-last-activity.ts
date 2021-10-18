import moment from 'moment'
import { Response } from 'express'
import { Volunteer } from '../models/Volunteer'
import { Student } from '../models/Student'
import { updateLastActivityUser } from '../services/UserService'
import { LoadedRequest } from '../router/app'

export function addLastActivity(
  req: LoadedRequest,
  res: Response,
  next: Function
): void {
  if (Object.prototype.hasOwnProperty.call(req, 'user')) {
    const { _id, lastActivityAt } = req.user as Volunteer | Student
    // Convert all times to UTC for consistency
    const today = moment().utc()
    const lastActivityMoment = moment(lastActivityAt).utc()
    if (today.isAfter(lastActivityMoment, 'day')) {
      updateLastActivityUser({ userId: _id, lastActivityAt: today.toDate() })
        .then(() => next())
        .catch(err => next(err))
    } else {
      next()
    }
  } else {
    next()
  }
}
