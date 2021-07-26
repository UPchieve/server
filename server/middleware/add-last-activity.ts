import moment from 'moment'
import { Request, Response } from 'express'
import { updateLastActivityUser } from '../services/UserService'

export function addLastActivity(
  req: Request,
  res: Response,
  next: Function
): void {
  if (Object.prototype.hasOwnProperty.call(req, 'user')) {
    const { _id, lastActivityAt } = req.user
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
