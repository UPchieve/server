import { Types } from 'mongoose'
import IpAddressModel, { IpAddress } from './index'
import { cleanIpString } from '../../utils/clean-ip-string'
import { RepoReadError, RepoUpdateError, RepoCreateError } from '../Errors'
import { IP_ADDRESS_STATUS } from '../../constants'

export async function getIpByRawString(
  rawIpString: string
): Promise<IpAddress | undefined> {
  try {
    const ip = await IpAddressModel.findOne({ ip: cleanIpString(rawIpString) })
      .lean()
      .exec()
    if (ip) return ip as IpAddress
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function createIpByRawString(
  rawIpString: string
): Promise<IpAddress> {
  try {
    const ip = await IpAddressModel.create({ ip: cleanIpString(rawIpString) })
    return ip.toObject() as IpAddress
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function updateIpUserById(
  ipId: Types.ObjectId,
  userId: Types.ObjectId
): Promise<void> {
  try {
    const result = await IpAddressModel.updateOne(
      {
        _id: ipId,
      },
      {
        $addToSet: { users: userId },
      }
    ).exec()
    if (!result.acknowledged)
      throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}

export async function unbanIpsByUser(userId: Types.ObjectId): Promise<void> {
  try {
    const result = await IpAddressModel.updateMany(
      { users: userId },
      { status: IP_ADDRESS_STATUS.OK }
    ).exec()
    if (!result.acknowledged)
      throw new RepoUpdateError('Update query was not acknowledged')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}
