import { merge } from 'lodash'
import { Types, UpdateQuery } from 'mongoose'
import {
  UserSessionMetrics,
  UserSessionMetricsDocument,
  UserSessionMetricsModel,
} from './index'
import { RepoCreateError, RepoReadError, RepoUpdateError } from '../Errors'
import { validUser } from '../../utils/validators'

// Create functions
export async function createUSMByUserId(
  userId: Types.ObjectId
): Promise<UserSessionMetrics> {
  const usm = await getUSMByUserId(userId)
  if (usm)
    throw new RepoCreateError(
      `UserSessionMetrics document for user ${userId} already exists`
    )
  if (!(await validUser(userId)))
    throw new RepoCreateError(`User ${userId} does not exist`)

  try {
    const data = (await UserSessionMetricsModel.create({
      user: userId,
    })) as UserSessionMetricsDocument
    if (data) return data.toObject() as UserSessionMetrics
    else throw new RepoCreateError('Create query did not return created object')
  } catch (err) {
    if (err instanceof RepoCreateError) throw err
    throw new RepoCreateError(err)
  }
}

// Read functions
export async function getUSMById(
  id: Types.ObjectId
): Promise<UserSessionMetrics | undefined> {
  try {
    const usm = await UserSessionMetricsModel.findOne({ _id: id })
      .lean()
      .exec()
    if (usm) return usm as UserSessionMetrics
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getAllUSM(): Promise<UserSessionMetrics[]> {
  try {
    return (await UserSessionMetricsModel.find()
      .lean()
      .exec()) as UserSessionMetrics[]
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getUSMByUserId(
  userId: Types.ObjectId
): Promise<UserSessionMetrics | undefined> {
  try {
    const usm = await UserSessionMetricsModel.findOne({
      user: userId,
    })
      .lean()
      .exec()
    if (usm) return usm as UserSessionMetrics
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// Update functions
export type UserSessionMetricsUpdateQuery = UpdateQuery<
  UserSessionMetricsDocument
>

// NOTE: when queries are merged conflicting scalar values will be overwritten
// ex: a = { a: { aa: 1, bb: 2 } }, b = { a: { aa: 3, cc: 4 } }
// merge(a,b) => a = { a: { aa: 3, bb: 2, cc: 4 } }
export async function executeUSMUpdatesByUserId(
  userId: Types.ObjectId,
  queries: UserSessionMetricsUpdateQuery[]
): Promise<void> {
  const update = {}
  for (const q of queries) {
    merge(update, q)
  }
  try {
    const result = await UserSessionMetricsModel.updateOne(
      { user: userId },
      update
    )
    if (!result.ok)
      throw new RepoUpdateError('Update query did not return "ok"')
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to execute merged update ${update} for user ${userId}: ${
        (err as Error).message
      }`
    )
  }
}
