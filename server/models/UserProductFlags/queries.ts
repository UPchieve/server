import { Types } from 'mongoose'
import UserProductFlagsModel, { UserProductFlags } from './index'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { validUser } from '../../utils/validators'

// Create functions
export async function createUPFByUserId(
  userId: Types.ObjectId
): Promise<UserProductFlags> {
  const upf = await getUPFByUserId(userId)
  if (upf)
    throw new RepoCreateError(
      `UserProductFlags document for user ${userId} already exists`
    )
  if (!(await validUser(userId)))
    throw new RepoCreateError(`User ${userId} does not exist`)

  try {
    const data = await UserProductFlagsModel.create({
      user: userId,
    })
    if (data) return data.toObject() as UserProductFlags
    else throw new RepoCreateError('Create query did not return created object')
  } catch (err) {
    if (err instanceof RepoCreateError) throw err
    throw new RepoCreateError(err)
  }
}

// Read functions
export async function getUPFByObjectId(
  id: Types.ObjectId
): Promise<UserProductFlags | undefined> {
  try {
    const upf = await UserProductFlagsModel.findOne({ _id: id })
      .lean()
      .exec()
    if (upf) return upf as UserProductFlags
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAllUPF(): Promise<UserProductFlags[]> {
  try {
    return (await UserProductFlagsModel.find()
      .lean()
      .exec()) as UserProductFlags[]
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUPFByUserId(
  userId: Types.ObjectId
): Promise<UserProductFlags | undefined> {
  try {
    const upf = await UserProductFlagsModel.findOne({
      user: userId,
    })
      .lean()
      .exec()
    if (upf) return upf as UserProductFlags
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export type PublicProductFlags = Pick<UserProductFlags, 'gatesQualified'>

export async function getPublicUPFByUserId(
  userId: Types.ObjectId
): Promise<PublicProductFlags | undefined> {
  try {
    const upf = await UserProductFlagsModel.findOne(
      {
        user: userId,
      },
      {
        gatesQualified: 1,
      }
    )
      .lean()
      .exec()
    if (upf) return upf
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// Update functions
export async function updateUPFGatesQualifiedFlagById(
  userId: Types.ObjectId,
  status: boolean
): Promise<void> {
  try {
    const result = await UserProductFlagsModel.updateOne(
      { user: userId },
      {
        gatesQualified: status,
      }
    )
    if (!result.ok)
      throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    if (err instanceof RepoUpdateError) throw err
    throw new RepoUpdateError(err)
  }
}
