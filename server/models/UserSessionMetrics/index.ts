import { Document, model, Schema, Types, ValidatorProps } from 'mongoose'
import { validUser } from '../../utils/validators'
import { User } from '../User'

// The MetricType and METRIC_TYPES below outline the underlying value type of
// metrics and the path to such metrics on the USM object
export type Counter = number
// export type Label = string
// export type Statistic = number (float)
export type MetricType = Counter // | Label | Statistic ...

export enum METRIC_TYPES {
  counters = 'counters',
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
    message: (props: ValidatorProps) => `${props.value} is not an integer`,
  },
}

const userSessionMetricsSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    validate: {
      validator: validUser,
      message: (props: ValidatorProps) => `${props.value} is not a valid user`,
    },
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
    hasHadTechnicalIssues: counterSchema,
  },
})

const UserSessionMetricsCollection = 'UserSessionMetrics'

export const UserSessionMetricsModel = model<UserSessionMetricsDocument>(
  UserSessionMetricsCollection,
  userSessionMetricsSchema
)

export default UserSessionMetricsModel
