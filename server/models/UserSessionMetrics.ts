/* eslint @typescript-eslint/no-use-before-define: 0 */

import { merge } from 'lodash'
import {
  Document,
  model,
  Schema,
  Types,
  SchemaTypeOpts,
  UpdateQuery
} from 'mongoose'
import UserModel, { User } from './User'
import { RepoCreateError, RepoReadError, RepoUpdateError } from './Errors'

// The MetricType and METRIC_TYPES below outline the underlying value type of
// metrics and the path to such metrics on the USM object
export type Counter = number
// export type Label = string
// export type Statistic = number (float)
export type MetricType = Counter // | Label | Statistic ...

export enum METRIC_TYPES {
  counters = 'counters'
  // labels = 'labels
  // statistics = 'statistics
}

export interface UserSessionMetrics {
  _id: Types.ObjectId
  user: Types.ObjectId | User
  counters: {
    absentStudent: number
    absentVolunteer: number
    lowSessionRatingFromCoach: number
    lowSessionRatingFromStudent: number
    lowCoachRatingFromStudent: number
    reported: number
    onlyLookingForAnswers: number
    rudeOrInappropriate: number
    commentFromStudent: number // student has left a comment in the feedback form
    commentFromVolunteer: number // volunteer has left a comment in the feedback form
    hasBeenUnmatched: number // user has had sessions longer than 1 minute end unmatched
    hasHadTechnicalIssues: number // user has had sessions where the volunteer reported technical issues
  }
}

export type UserSessionMetricsDocument = UserSessionMetrics & Document

const counterSchema = {
  type: Number,
  default: 0,
  validate: {
    validator: Number.isInteger,
    message: (props: SchemaTypeOpts.ValidatorProps) =>
      `${props.value} is not an integer`
  }
}

const userSessionMetricsSchema = new Schema({
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
  counters: {
    absentStudent: counterSchema,
    absentVolunteer: counterSchema,
    lowSessionRatingFromCoach: counterSchema,
    lowSessionRatingFromStudent: counterSchema,
    lowCoachRatingFromStudent: counterSchema,
    reported: counterSchema,
    onlyLookingForAnswers: counterSchema,
    rudeOrInappropriate: counterSchema,
    commentFromStudent: counterSchema,
    commentFromVolunteer: counterSchema,
    hasBeenUnmatched: counterSchema,
    hasHadTechnicalIssues: counterSchema
  }
})

const UserSessionMetricsCollection = 'UserSessionMetrics'

export const UserSessionMetricsModel = model<UserSessionMetricsDocument>(
  UserSessionMetricsCollection,
  userSessionMetricsSchema
)

// Utilities
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
): Promise<UserSessionMetrics> {
  const usm = await getByUserId(userId)
  if (usm)
    throw new RepoCreateError(
      `UserSessionMetrics document for user ${userId} already exists`
    )
  if (!(await validUser(userId)))
    throw new RepoCreateError(`User ${userId} does not exist`)

  try {
    const data = (await UserSessionMetricsModel.create({
      user: userId
    })) as UserSessionMetricsDocument
    if (data) return data.toObject() as UserSessionMetrics
    else throw new Error('Create query did not return created object')
  } catch (err) {
    throw new RepoCreateError(err.message)
  }
}

// Read functions
export async function getByObjectId(
  id: Types.ObjectId | string,
  projection: any = {}
): Promise<UserSessionMetrics> {
  try {
    return (await UserSessionMetricsModel.findById(id, projection)
      .lean()
      .exec()) as UserSessionMetrics
  } catch (err) {
    throw new RepoReadError(err.message)
  }
}

export async function getAll(): Promise<UserSessionMetrics[]> {
  try {
    return (await UserSessionMetricsModel.find()
      .lean()
      .exec()) as UserSessionMetrics[]
  } catch (err) {
    throw new RepoReadError(err.message)
  }
}

export async function getByUserId(
  userId: Types.ObjectId | string
): Promise<UserSessionMetrics> {
  try {
    return (await UserSessionMetricsModel.findOne({
      user: userId
    })
      .lean()
      .exec()) as UserSessionMetrics
  } catch (err) {
    throw new RepoReadError(err.message)
  }
}

// Update functions
export type UserSessionMetricsUpdateQuery = UpdateQuery<
  UserSessionMetricsDocument
>

// NOTE: when queries are merged conflicting scalar values will be overwritten
// ex: a = { a: { aa: 1, bb: 2 } }, b = { a: { aa: 3, cc: 4 } }
// merge(a,b) => a = { a: { aa: 3, bb: 2, cc: 4 } }
export async function executeUpdatesByUserId(
  userId: Types.ObjectId | string,
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
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to execute update ${update} for user ${userId}: ${err.message}`
    )
  }
}
