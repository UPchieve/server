import { Document, model, Schema, Types, ValidatorProps } from 'mongoose'
import { validUser } from '../../utils/validators'
import { Ulid } from '../pgUtils'
import { User } from '../User'

export interface PgUserProductFlags {
  userId: Ulid
  sentReadyToCoachEmail: boolean
  sentHourSummaryIntroEmail: boolean
  sentInactiveThirtyDayEmail: boolean
  sentInactiveSixtyDayEmail: boolean
  sentInactiveNinetyDayEmail: boolean
  gatesQualified: boolean
  createdAt: Date
  updatedAt: Date

  // user_id uuid NOT NULL,
  // sent_ready_to_coach_email boolean DEFAULT false NOT NULL,
  // sent_hour_summary_intro_email boolean DEFAULT false NOT NULL,
  // sent_inactive_thirty_day_email boolean DEFAULT false NOT NULL,
  // sent_inactive_sixty_day_email boolean DEFAULT false NOT NULL,
  // sent_inactive_ninety_day_email boolean DEFAULT false NOT NULL,
  // gates_qualified boolean DEFAULT false NOT NULL,
  // created_at timestamp with time zone NOT NULL,
  // updated_at timestamp with time zone NOT NULL
}

export interface UserProductFlags {
  _id: Types.ObjectId
  user: Types.ObjectId | User
  gatesQualified: boolean
}

type UserProductFlagsDocument = UserProductFlags & Document

const UserProductFlagsSchema = new Schema({
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
  gatesQualified: {
    type: Boolean,
    default: false,
  },
})

const UserProductFlagsCollection = 'UserProductFlags'

const UserProductFlagsModel = model<UserProductFlagsDocument>(
  UserProductFlagsCollection,
  UserProductFlagsSchema
)

export default UserProductFlagsModel
