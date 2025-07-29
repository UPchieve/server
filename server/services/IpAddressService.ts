import axios from 'axios'
import Sentry from '@sentry/node'
import {
  IpAddress,
  getIpByRawString,
  insertIpByRawString,
} from '../models/IpAddress'
import { logError } from '../logger'
import { NotAllowedError } from '../models/Errors'
import { asString } from '../utils/type-utils'
import net from 'net'
import { cleanIpString } from '../utils/clean-ip-string'
import config from '../config'
import { isValidConfigToken } from '../utils/environments'

export async function getIpWhoIs(rawIpString: string) {
  const ipString = cleanIpString(rawIpString)
  const ipWhoIsUrl = getIpWhoIsUrl(ipString)

  try {
    const { data } = (await axios.get(ipWhoIsUrl, {
      timeout: 1500,
    })) as any
    return data
  } catch (err) {
    Sentry.captureException(err)
    logError(err as Error)
    // TODO: should we just throw here?
    return {}
  }
}

function getIpWhoIsUrl(ipString: string): string {
  const baseUrl = config.ipWhoIsUrl
  const urlWithPath = `${baseUrl}/${ipString}`
  if (isValidConfigToken(config.ipWhoIsApiKey)) {
    return `${urlWithPath}?key=${config.ipWhoIsApiKey}`
  }
  return urlWithPath
}

export async function findOrCreateIpAddress(
  rawIpString: string
): Promise<IpAddress> {
  const ipString = cleanIpString(rawIpString)
  const existingIpAddress = await getIpByRawString(ipString)

  if (existingIpAddress) return existingIpAddress

  const newIpAddress = await insertIpByRawString(ipString)
  return newIpAddress
}

function isValidIp(ip: string): boolean {
  // net.isIp return 0 for non-IPs, 4 for ipv4, and 6 for ipv6
  return net.isIP(ip) > 0
}

export async function checkIpAddress(data: unknown | string) {
  const ip = asString(data)
  if (!isValidIp(ip)) throw new Error('Not a valid IP address')

  const { country_code: countryCode } = await getIpWhoIs(ip)
  if (countryCode && countryCode !== 'US') throw new NotAllowedError()
}
