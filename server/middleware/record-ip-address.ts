import { captureException } from '@sentry/node'
import { Request } from 'express'

import { record, ban } from '../services/IpAddressService'

export const recordIpAddress = async (
  req: Request,
  res: Response,
  next: Function
): Promise<void> => {
  const { user, ip: ipString } = req

  try {
    const ipAddress = await record({ user, ipString })
    const didBanUser = await ban({ user, ipAddress })
    if (didBanUser) user.isBanned = true
  } catch (error) {
    captureException(error)
  }

  next()
}
