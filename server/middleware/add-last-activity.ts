import { Request, Response } from 'express'
import { ONE_DAY_ELAPSED_MILLISECONDS } from '../constants'
import { updateLastActivityUser } from '../services/UserService'

export function addLastActivity(
  req: Request,
  res: Response,
  next: Function
): void {
  if (Object.prototype.hasOwnProperty.call(req, 'user')) {
    const { _id, lastActivityAt } = req.user
    const todaysDate = new Date()
    const lastActivityInMS = new Date(lastActivityAt).getTime()
    if (
      lastActivityInMS + ONE_DAY_ELAPSED_MILLISECONDS <=
      todaysDate.getTime()
    ) {
      updateLastActivityUser({ userId: _id, lastActivityAt: todaysDate })
        .then(() => next())
        .catch(err => next(err))
    } else {
      next()
    }
  } else {
    next()
  }
}
