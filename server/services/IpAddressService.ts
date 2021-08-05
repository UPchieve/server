import axios from 'axios'
import Sentry from '@sentry/node'
import IpAddressModel, { IpAddress } from '../models/IpAddress'
import UserModel, { User } from '../models/User'
import {IP_ADDRESS_STATUS, USER_BAN_REASON} from '../constants'
import * as MailService from './MailService'
import {NotAllowedError} from '../models/Errors'
import {asString} from '../utils/type-utils'
import net from 'net'
import {Types} from 'mongoose'

export function cleanIpString(rawIpString: string) {
  // Remove ipv6 prefix if present
  return rawIpString.indexOf('::ffff:') === 0 ? rawIpString.slice(7) : rawIpString
}

export async function getIpWhoIs(rawIpString: string) {
  const ipString = cleanIpString(rawIpString)

  try {
    const { data } = await axios.get(
      `http://free.ipwhois.io/json/${ipString}`,
      {
        timeout: 1500
      }
    )
    return data
  } catch (err) {
    Sentry.captureException(err)
    return {}
  }
}

export async function findOrCreateIpAddress(rawIpString: string) {
  const ipString = cleanIpString(rawIpString)
  const existingIpAddress = await IpAddressModel.findOne({ ip: ipString })
    .lean()
    .exec()

  if (existingIpAddress) return existingIpAddress

  return await new IpAddressModel({ip: ipString}).save()
}

function isValidIp(ip: string) {
  return net.isIP(ip)
}

export async function checkIpAddress(data: unknown) {
  const ip = asString(data)
  if (!isValidIp(ip)) throw new Error('Not a valid IP address')

  const { country_code: countryCode } = await getIpWhoIs(ip)
  if (countryCode && countryCode !== 'US') throw new NotAllowedError()
}


export async function record(user: User, ipString: string) {
  const userIpAddress = await findOrCreateIpAddress(ipString)
  const alreadyRecorded = userIpAddress.users.some((u: Types.ObjectId) =>  {
    u.equals(user._id)
  })

  if (!alreadyRecorded) {
    await UserModel.updateOne(
      { _id: user._id },
      { $addToSet: { ipAddresses: userIpAddress._id } }
    )
    await IpAddressModel.updateOne(
      { _id: userIpAddress._id },
      { $addToSet: { users: user._id } }
    )
  }

  return userIpAddress
}

export async function ban(user: User, ipAddress: IpAddress) {
  let didBanUser = false
  const isOnlyUserWithIpAddress =
    ipAddress.users.length === 1 &&
    ipAddress.users[0].toString() === user._id.toString()

  // Ban IP if it has only one user listed and user is banned
  if (
    user.isBanned &&
    ipAddress.status === IP_ADDRESS_STATUS.OK &&
    isOnlyUserWithIpAddress
  )
    await IpAddressModel.updateOne(
      { _id: ipAddress._id },
      { $set: { status: IP_ADDRESS_STATUS.BANNED } }
    )

  // Ban user if IP banned
  if (ipAddress.status === IP_ADDRESS_STATUS.BANNED && !user.isBanned) {
    didBanUser = true
    const updatedUser = Object.assign(user, { isBanned: true })
    // Update user in the SendGrid contact list with banned status
    await MailService.createContact(updatedUser)
    await MailService.sendBannedUserAlert(
      user._id.toString(),
      USER_BAN_REASON.BANNED_IP,
      ''
    )
    await UserModel.updateOne(
      { _id: user._id },
      { $set: { isBanned: true, banReason: USER_BAN_REASON.BANNED_IP } }
    )
  }

  return didBanUser
}

export async function unbanUserIps(user: User) {
  await IpAddressModel.updateMany(
    { users: user._id },
    { status: IP_ADDRESS_STATUS.OK }
  )
}

