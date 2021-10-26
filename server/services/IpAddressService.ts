import axios from 'axios'
import Sentry from '@sentry/node'
import { Types } from 'mongoose'
import { IpAddress } from '../models/IpAddress'
import {
  getIpByRawString,
  createIpByRawString,
  updateIpUserById,
} from '../models/IpAddress/queries'
import { updateUserIpById } from '../models/User/queries'
import { NotAllowedError } from '../models/Errors'
import { asString } from '../utils/type-utils'
import net from 'net'
import { cleanIpString } from '../utils/clean-ip-string'

export async function getIpWhoIs(rawIpString: string) {
  const ipString = cleanIpString(rawIpString)

  try {
    const { data } = await axios.get(
      `http://free.ipwhois.io/json/${ipString}`,
      {
        timeout: 1500,
      }
    )
    return data
  } catch (err) {
    Sentry.captureException(err)
    return {}
  }
}

export async function findOrCreateIpAddress(
  rawIpString: string
): Promise<IpAddress> {
  const ipString = cleanIpString(rawIpString)
  const existingIpAddress = await getIpByRawString(ipString)

  if (existingIpAddress) return existingIpAddress

  const newIpAddress = await createIpByRawString(ipString)
  return newIpAddress
}

function isValidIp(ip: string) {
  return net.isIP(ip)
}

export async function checkIpAddress(data: unknown | string) {
  const ip = asString(data)
  if (!isValidIp(ip)) throw new Error('Not a valid IP address')

  const { country_code: countryCode } = await getIpWhoIs(ip)
  if (countryCode && countryCode !== 'US') throw new NotAllowedError()
}

export async function record(userId: Types.ObjectId, ipString: string) {
  const userIpAddress = await findOrCreateIpAddress(ipString)
  const alreadyRecorded = (userIpAddress.users as Types.ObjectId[]).some(u =>
    u.equals(userId)
  )

  if (!alreadyRecorded) {
    await updateUserIpById(userId, userIpAddress._id)
    await updateIpUserById(userIpAddress._id, userId)
  }

  return userIpAddress
}
