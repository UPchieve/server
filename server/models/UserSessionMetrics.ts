/* eslint @typescript-eslint/no-use-before-define: 0 */

import { Document, model, Schema, Types, SchemaTypeOpts } from 'mongoose'
import UserModel, { User } from './User'
import { RepoCreateError, RepoReadError, RepoUpdateError } from './Errors'

// TODO: type FLAGS and flagCounts to match flag enum/type/const programmatically
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
  hasBeenUnmatched = 'Has been unmatched',
  hasHadTechnicalIssues = 'Has had technical issues'
}

export interface UserSessionMetrics {
  _id: Types.ObjectId
  user: Types.ObjectId | User
  flagCounts: {
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
  flagCounts: {
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
export async function createByUser(
  user: Types.ObjectId | string
): Promise<UserSessionMetrics> {
  const ad = await getByUser(user)
  if (ad)
    throw new RepoCreateError(
      `UserSessionMetrics document for user ${user} already exists`
    )
  if (!(await validUser(user)))
    throw new RepoCreateError(`User ${user} does not exist`)

  try {
    const data = (await UserSessionMetricsModel.create({
      user
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

export async function getByUser(
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
export async function incrementFlagCountByUser(
  userId: Types.ObjectId | string,
  flag: FLAGS
): Promise<void> {
  try {
    await UserSessionMetricsModel.updateOne(
      { user: userId },
      { [`flagCounts.${flag}`]: { $inc: 1 } }
    )
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to increment session metric flag ${flag} for user ${userId}: ${err.message}`
    )
  }
}

export async function incrementCounterByUser(
  userId: Types.ObjectId | string,
  counter: COUNTERS
): Promise<void> {
  try {
    await UserSessionMetricsModel.updateOne(
      { user: userId },
      { [`counters.${counter}`]: { $inc: 1 } }
    )
  } catch (err) {
    throw new RepoUpdateError(
      `Failed to increment session metric counter ${counter} for user ${userId}: ${err.message}`
    )
  }
}
