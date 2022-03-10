import { values } from 'lodash'
import { Document, model, Model, Schema, Types } from 'mongoose'
import { USER_SESSION_METRICS, SUBJECT_TYPES } from '../../constants'
import MessageModel, { Message } from '../Message'
import { Notification } from '../Notification'
import { User } from '../User'
import { Student } from '../Student'
import { Volunteer } from '../Volunteer'
import { Pgid, Ulid } from '../pgUtils'

export type PgSession = {
  id: Ulid
  studentId: Ulid
  volunteerId?: Ulid
  subjectId: Pgid
  hasWhiteboardDoc: boolean
  quillDoc?: string
  volunteerJoinedAt?: Date
  endedAt?: Date
  endedByRoleId?: Pgid
  reviewed: boolean
  toReview: boolean
  studentBanned?: boolean
  timeTutored: number
  createdAt: Date
  updatedAt: Date
}

const validTypes = [
  SUBJECT_TYPES.MATH,
  SUBJECT_TYPES.COLLEGE,
  SUBJECT_TYPES.SCIENCE,
  SUBJECT_TYPES.SAT,
  SUBJECT_TYPES.READING_WRITING,
]

export interface Session {
  _id: Types.ObjectId
  student: Types.ObjectId | Student
  volunteer?: Types.ObjectId | Volunteer
  type: string
  subTopic: string
  messages: Message[]
  hasWhiteboardDoc?: boolean
  whiteboardDoc?: string
  quillDoc?: string
  createdAt: Date
  volunteerJoinedAt?: Date
  failedJoins: (Types.ObjectId | User)[]
  endedAt?: Date
  // NOTE: endedBy is sometimes null when the session is ended by worker job
  //        due to the session being unmatched for an extended period of time
  endedBy?: Types.ObjectId | User | null
  notifications: (Types.ObjectId | Notification)[]
  photos: string[]
  isReported: boolean
  reportReason?: string
  reportMessage?: string
  flags: string[]
  reviewed: boolean
  toReview: boolean
  reviewReasons: USER_SESSION_METRICS[]
  timeTutored?: number
}

export type SessionDocument = Session & Document

const sessionSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    // TODO: validate isVolunteer: false
  },
  volunteer: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    // TODO: validate isVolunteer: true
  },
  type: {
    type: String,
    validate: {
      validator: function(v: string): boolean {
        const type = v.toLowerCase()
        return validTypes.some(function(validType) {
          return validType.toLowerCase() === type
        })
      },
      message: '{VALUE} is not a valid type',
    },
  },

  subTopic: {
    type: String,
    default: '',
  },

  messages: [MessageModel.schema],

  hasWhiteboardDoc: {
    type: Boolean,
  },

  quillDoc: {
    type: String,
    default: '',
    select: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  volunteerJoinedAt: {
    type: Date,
  },

  failedJoins: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],

  endedAt: {
    type: Date,
  },

  endedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },

  notifications: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Notification',
    },
  ],

  photos: [String],
  isReported: {
    type: Boolean,
    default: false,
  },
  reportReason: String,
  reportMessage: String,
  flags: {
    type: [String],
    enum: values(USER_SESSION_METRICS),
  },
  reviewed: { type: Boolean, default: false },
  toReview: { type: Boolean, default: false },
  reviewReasons: {
    type: [String],
    enum: values(USER_SESSION_METRICS),
  },
  timeTutored: { type: Number, default: 0 },
  isStudentBanned: Boolean,
})

export interface SessionStaticModel extends Model<SessionDocument> {
  getUnfulfilledSessions(): Promise<SessionDocument[]>
}

const SessionModel = model<SessionDocument, SessionStaticModel>(
  'Session',
  sessionSchema
)

export default SessionModel
