import IpAddressService from '../services/IpAddressService'
import Sentry from '@sentry/node'

export default async function recordIpAddress(req, res, next) {
  const { user, ip: ipString } = req

  try {
    const ipAddress = await IpAddressService.record({ user, ipString })
    const didBanUser = await IpAddressService.ban({ user, ipAddress })
    if (didBanUser) req.user.isBanned = true
  } catch (error) {
    Sentry.captureException(error)
  }

  next()
}
