/* eslint @typescript-eslint/no-use-before-define: 0 */

import { Document, model, Schema, Types, SchemaTypeOpts } from 'mongoose'
import UserModel, { User } from './User'
import { RepoCreateError, RepoReadError, RepoUpdateError } from './Errors'

// TODO: type FLAGS and flagCounters to match flag enum/type/const programmatically
export enum FLAGS {
  absentStudentFlag,
  absentVolunteerFlag,
  lowSessionRatingFromCoachFlag,
  lowSessionRatingFromStudentFlag,
  lowCoachRatingFromStudentFlag,
  reported,
  onlyLookingForAnswers,
  rudeOrInappropriate
}

export enum COUNTERS {
  hasBeenUnmatched,
  hasHadTechnicalIssues
}

export interface UserSessionMetrics {
  _id: Types.ObjectId
  user: Types.ObjectId | User
  flagCounters: {
    absentStudentFlag: number
    absentVolunteerFlag: number
    lowSessionRatingFromCoachFlag: number
    lowSessionRatingFromStudentFlag: number
    lowCoachRatingFromStudentFlag: number
    reported: number
    onlyLookingForAnswers: number
    rudeOrInappropriate: number
  }
  counters: {
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
  flagCounters: {
    absentStudentFlag: counterSchema,
    absentVolunteerFlag: counterSchema,
    lowSessionRatingFromCoachFlag: counterSchema,
    lowSessionRatingFromStudentFlag: counterSchema,
    lowCoachRatingFromStudentFlag: counterSchema,
    reported: counterSchema,
    onlyLookingForAnswers: counterSchema,
    rudeOrInappropriate: counterSchema
  },
  counters: {
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
export async function incrementFlagCounterByUserId(
  userId: Types.ObjectId | string,
  flag: FLAGS
): Promise<void> {
  try {
    const result = await UserSessionMetricsModel.updateOne(
      { user: userId },
      { $inc: { [`flagCounters.${FLAGS[flag]}`]: 1 } }
    )
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to increment session metric flag ${flag} for user ${userId}: ${err.message}`
    )
  }
}

export async function incrementCounterByUserId(
  userId: Types.ObjectId | string,
  counter: COUNTERS
): Promise<void> {
  try {
    const result = await UserSessionMetricsModel.updateOne(
      { user: userId },
      { $inc: { [`counters.${COUNTERS[counter]}`]: 1 } }
    )
    if (!result.ok) throw new Error('Update query did not return "ok"')
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to increment session metric counter ${counter} for user ${userId}: ${err.message}`
    )
  }
}
