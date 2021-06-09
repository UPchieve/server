import { captureException } from '@sentry/node'
import { LoadedRequest } from '../router/app'

import { record, ban } from '../services/IpAddressService'

export const recordIpAddress = async (
  req: LoadedRequest,
  res: Response,
  next: Function
): Promise<void> => {
  const { user, ip: ipString } = req as LoadedRequest

  try {
    const ipAddress = await record({ user, ipString })
    const didBanUser = await ban({ user, ipAddress })
    if (didBanUser) user.isBanned = true
  } catch (error) {
    captureException(error)
  }

  next()
}
