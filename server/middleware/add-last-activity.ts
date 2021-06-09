import { Request, Response } from 'express'
import { ONE_DAY_ELAPSED_MILLISECONDS } from '../constants'
import { LoadedRequest } from '../router/app'
import { updateLastActivityUser } from '../services/UserService'

export function addLastActivity(
  req: Request | LoadedRequest,
  res: Response,
  next: Function
): void {
  if (Object.prototype.hasOwnProperty.call(req, 'user')) {
    const loadedRequest: LoadedRequest = req as LoadedRequest
    const { _id, lastActivityAt } = loadedRequest.user
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
