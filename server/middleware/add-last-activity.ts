import moment from 'moment'
import { Request, Response, NextFunction } from 'express'
import { updateUserLastActivityById } from '../models/User/queries'
import { extractUser } from '../router/extract-user'

export async function addLastActivity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (Object.prototype.hasOwnProperty.call(req, 'user')) {
    const { id, lastActivityAt } = extractUser(req)
    // Convert all times to UTC for consistency
    const today = moment().utc()
    const lastActivityMoment = moment(lastActivityAt).utc()
    if (today.isAfter(lastActivityMoment, 'day')) {
      try {
        await updateUserLastActivityById(id, today.toDate())
      } catch (err) {
        return next(err)
      }
    }
    next()
  } else {
    next()
  }
}
