import axios from 'axios'
import Sentry from '@sentry/node'
import {
  IpAddress,
  getIpByRawString,
  insertIpByRawString,
} from '../models/IpAddress'
import { NotAllowedError } from '../models/Errors'
import { asString } from '../utils/type-utils'
import net from 'net'
import { cleanIpString } from '../utils/clean-ip-string'
import config from '../config'

export async function getIpWhoIs(rawIpString: string) {
  const ipString = cleanIpString(rawIpString)
  const ipWhoIs =
    config.NODE_ENV === 'dev'
      ? `http://free.ipwhois.io/json/${ipString}`
      : `http://ipwhois.pro/json/${ipString}?key=${config.ipWhoIsApiKey}`

  try {
    const { data } = await axios.get(ipWhoIs, {
      timeout: 1500,
    })
    return data
  } catch (err) {
    Sentry.captureException(err)
    // TODO: should we just throw here?
    return {}
  }
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
