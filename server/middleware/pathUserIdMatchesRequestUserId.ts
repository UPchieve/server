import { Request, Response, NextFunction } from 'express'
import logger from '../logger'
import { DEFAULT_ERROR_MESSAGE } from '../models/Errors'

export const pathUserIdMatchesRequestUserId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const pathUserId: string | undefined = req.params?.userId
  const requestUserId: string | undefined = req.user?.id
  if (pathUserId && requestUserId && pathUserId === requestUserId) {
    next()
  } else {
    logger.error(
      { requestUserId, pathUserId },
      "Requesting user's ID does not match the userId given in the path"
    )
    next(new Error(DEFAULT_ERROR_MESSAGE))
  }
}
