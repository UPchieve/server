/* eslint @typescript-eslint/no-use-before-define: 0 */

import { merge } from 'lodash'
import {
  Document,
  model,
  Schema,
  Types,
  UpdateQuery
} from 'mongoose'
import UserModel, { User } from './User'
import { RepoCreateError, RepoReadError, RepoUpdateError } from './Errors'

export interface UserProductFlags {
  _id: Types.ObjectId
  user: Types.ObjectId | User
  gatesQualified: Boolean
}

export type UserProductFlagsDocument = UserProductFlags & Document

const UserProductFlagsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    validate: {
      validator: validUser,
      message: props => `${props.value} is not a valid user`
    }
  },
  gatesQualified: Boolean
})

const UserProductFlagsCollection = 'UserProductFlags'

export const UserProductFlagsModel = model<UserProductFlagsDocument>(
  UserProductFlagsCollection,
  UserProductFlagsSchema
)

// Utilities
// @todo: move to a utils file
async function validUser(userId: Types.ObjectId | string): Promise<boolean> {
  const user = await UserModel.findById(userId)
    .lean()
    .exec()
  if (!user) return false
  return true
}

// Create functions
export async function createByUserId(
  userId: Types.ObjectId | string
): Promise<UserProductFlags> {
  const upf = await getByUserId(userId)
  if (upf)
    throw new RepoCreateError(
      `UserProductFlags document for user ${userId} already exists`
    )
  if (!(await validUser(userId)))
    throw new RepoCreateError(`User ${userId} does not exist`)

  try {
    const data = (await UserProductFlagsModel.create({
      user: userId
    })) as UserProductFlagsDocument
    if (data) return data.toObject() as UserProductFlags
    else throw new Error('Create query did not return created object')
  } catch (err) {
    throw new RepoCreateError(err.message)
  }
}

// Read functions
export async function getByObjectId(
  id: Types.ObjectId | string,
  projection: any = {}
): Promise<UserProductFlags> {
  try {
    return (await UserProductFlagsModel.findById(id, projection)
      .lean()
      .exec()) as UserProductFlags
  } catch (err) {
    throw new RepoReadError(err.message)
  }
}

export async function getAll(): Promise<UserProductFlags[]> {
  try {
    return (await UserProductFlagsModel.find()
      .lean()
      .exec()) as UserProductFlags[]
  } catch (err) {
    throw new RepoReadError(err.message)
  }
}

export async function getByUserId(
  userId: Types.ObjectId | string
): Promise<UserProductFlags> {
  try {
    return (await UserProductFlagsModel.findOne({
      user: userId
    })
      .lean()
      .exec()) as UserProductFlags
  } catch (err) {
    throw new RepoReadError(err.message)
  }
}

// Update functions
export type UserProductFlagsUpdateQuery = UpdateQuery<UserProductFlagsDocument>

export async function executeUpdatesByUserId(
  userId: Types.ObjectId | string,
  queries: UserProductFlagsUpdateQuery[]
): Promise<void> {
  const update = {}
  for (const q of queries) {
    merge(update, q)
  }
  try {
    const result = await UserProductFlagsModel.updateOne(
      { user: userId },
      update
    )
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to execute update ${update} for user ${userId}: ${err.message}`
    )
  }
}
