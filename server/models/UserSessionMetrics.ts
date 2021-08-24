/* eslint @typescript-eslint/no-use-before-define: 0 */

import { Document, model, Schema, Types, SchemaTypeOpts } from 'mongoose'
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
  comments = 'Has left comments',
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
    comments: number // user has left a comment in the feedback form
    hasBeenUnmatched: number // user has had sessions longer than 1 minute end unmatched
    hasHadTechnicalIssues: number // user has had sessions where the volunteer reported technical issues
  }
}

type UserSessionMetricsDocument = UserSessionMetrics & Document

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
    comments: counterSchema,
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
export async function incrementCounterByUserId(
  userId: Types.ObjectId | string,
  metric: METRICS
): Promise<void> {
  try {
    const result = await UserSessionMetricsModel.updateOne(
      { user: userId },
      { $inc: { [`counters.${METRICS[metric]}`]: 1 } }
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
