/* eslint @typescript-eslint/no-use-before-define: 0 */

import { merge } from 'lodash'
import { Document, model, Schema, Types, ValidatorProps, UpdateQuery } from 'mongoose'
import UserModel, { User } from './User'
import { RepoCreateError, RepoReadError, RepoUpdateError } from './Errors'

export enum METRICS {
  absentStudent = 'Absent student',
  absentVolunteer = 'Absent volunteer',
  lowSessionRatingFromCoach = 'Low session rating from coach',
  lowSessionRatingFromStudent = 'Low session rating from student',
  lowCoachRatingFromStudent = 'Low coach rating from student',
  reported = 'Reported',
  onlyLookingForAnswers = 'Only looking for answers',
  rudeOrInappropriate = 'Rude or inapprioriate',
  commentFromStudent = 'Comment from student',
  commentFromVolunteer = 'Comment from volunteer',
  hasBeenUnmatched = 'Has been unmatched',
  hasHadTechnicalIssues = 'Has had technical issues'
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
    message: (props: ValidatorProps) =>
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
    hasHasTechnicalIssues: counterSchema
  }
})

const UserSessionMetricsCollection = 'UserSessionMetrics'

export const UserSessionMetricsModel = model<UserSessionMetricsDocument>(
  UserSessionMetricsCollection,
  userSessionMetricsSchema
)

// Utilities
function getEnumKeyByEnumValue<T extends { [index: string]: string }>(
  myEnum: T,
  enumValue: string
): keyof T | null {
  const keys = Object.keys(myEnum).filter(x => myEnum[x] === enumValue)
  return keys.length > 0 ? keys[0] : null
}

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
    return data.toObject() as UserSessionMetrics
  } catch (err) {
    throw new RepoCreateError(err.message)
  }
}

// Read functions
export async function getByObjectId(
  id: Types.ObjectId | string
): Promise<UserSessionMetrics> {
  try {
    return (await UserSessionMetricsModel.findById(id)
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
export type UserSessionMetricsUpdateQuery = UpdateQuery<UserSessionMetricsDocument>

export function buildIncrementCounterQuery(metric: METRICS): UserSessionMetricsUpdateQuery {
  const path = getEnumKeyByEnumValue(METRICS, metric)
  return { $inc: { [`counters.${path}`]: 1} }
}

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

export async function incrementCounterByUserId(
  userId: Types.ObjectId | string,
  metric: METRICS
): Promise<void> {
  try {
    const path = getEnumKeyByEnumValue(METRICS, metric)
    const result = await UserSessionMetricsModel.updateOne(
      { user: userId },
      { $inc: { [`counters.${path}`]: 1 } }
    )
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to increment session metric counter ${metric} for user ${userId}: ${err.message}`
    )
  }
}

/*  when we have root level, string metrics
enum METRICS {
  Label: 'session labeled'
}

export async function setMetricByUserId(
  userId: Types.ObjectId | string,
  metric: METRICS,
  value: string
): Promise<void> {
  try {
    const result = await UserSessionMetricsModel.updateOne(
      { user: userId },
      { [metric]: value }
    )
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch ( err) {
    throw new RepoUpdateError(
      `Failed to set session metric ${metric} for user ${userId}: ${err.message}`
    )
  }
}
*/
