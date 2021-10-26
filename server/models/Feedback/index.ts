import { Document, model, Schema, Types } from 'mongoose'
import { FEEDBACK_VERSIONS } from '../../constants'

export interface ResponseData {
  'rate-session': { rating: number }
  'session-experience': {
    'easy-to-answer-questions': number
    'feel-like-helped-student': number
    'feel-more-fulfilled': number
    'good-use-of-time': number
    'plan-on-volunteering-again': number
  }
  'other-feedback': string
  'rate-upchieve': {
    'achieve-goal': number
    'easy-to-use': number
    'get-help-faster': number
    'use-next-time': number
  }
  'rate-coach': {
    'achieve-goal': number
    'find-help': number
    knowledgeable: number
    nice: number
    'want-him/her-again': number
  }
  'technical-difficulties': string
  'asked-unprepared-questions': string
  'app-features-needed': string
}

export interface StudentTutoringFeedback {
  'session-goal': number
  'subject-understanding': number
  'coach-rating': number
  'coach-feedback': string
  'other-feedback': string
}

export interface StudentCounselingFeedback {
  'rate-session': { rating: number }
  'session-goal': string
  'coach-ratings': {
    'coach-knowedgable': number
    'coach-friendly': number
    'coach-help-again': number
  }
  'other-feedback': string
}

export interface VolunteerFeedback {
  'session-enjoyable': number
  'session-improvements': string
  'student-understanding': number
  'session-obstacles': number[]
  'other-feedback': string
}

export interface Feedback {
  _id: Types.ObjectId
  versionNumber: FEEDBACK_VERSIONS
  sessionId: Types.ObjectId
  type: string
  subTopic: string
  userType: string
  studentId: Types.ObjectId
  volunteerId: Types.ObjectId
  createdAt: Date
}

export interface FeedbackVersionOne extends Feedback {
  versionNumber: FEEDBACK_VERSIONS.ONE
  responseData: Partial<ResponseData>
}

export interface FeedbackVersionTwo extends Feedback {
  versionNumber: FEEDBACK_VERSIONS.TWO
  studentTutoringFeedback?: Partial<StudentTutoringFeedback>
  studentCounselingFeedback?: Partial<StudentCounselingFeedback>
  volunteerFeedback?: Partial<VolunteerFeedback>
}

export type FeedbackDocument = Feedback & Document

const ResponseDataSchema = new Schema(
  {
    'rate-session': { rating: Number },
    'session-experience': {
      'easy-to-answer-questions': Number,
      'feel-like-helped-student': Number,
      'feel-more-fulfilled': Number,
      'good-use-of-time': Number,
      'plan-on-volunteering-again': Number,
    },
    'other-feedback': String,
    'rate-upchieve': {
      'achieve-goal': Number,
      'easy-to-use': Number,
      'get-help-faster': Number,
      'use-next-time': Number,
    },
    'rate-coach': {
      'achieve-goal': Number,
      'find-help': Number,
      knowledgeable: Number,
      nice: Number,
      'want-him/her-again': Number,
    },
    'technical-difficulties': String,
    'asked-unprepared-questions': String,
    'app-features-needed': String,
    // TODO: uncomment once migration is completed. To allow for downgrading the migration,
    //        we will use the Schema.Types.Mixed on this property for now
    // 'session-goal': String,
    'coach-ratings': {
      'coach-knowedgable': Number,
      'coach-friendly': Number,
      'coach-help-again': Number,
    },
    // TODO: the 8 keys below are for backwards compatibility to allow for downgrading the migration.
    //        remove the below keys from this schema once migration is completed
    'subject-understanding': Number,
    'coach-rating': Number,
    'coach-feedback': String,
    // This key has two different types, in ResponseData it is a string,
    // but in StudentTutoringFeedback it is a number
    'session-goal': Schema.Types.Mixed,
    'session-enjoyable': Number,
    'session-improvements': String,
    'student-understanding': Number,
    'session-obstacles': {
      type: [Number],
      default: undefined,
    },
  },
  { _id: false }
)

const StudentTutoringFeedbackSchema = new Schema(
  {
    'session-goal': Number,
    'subject-understanding': Number,
    'coach-rating': Number,
    'coach-feedback': String,
    'other-feedback': String,
  },
  { _id: false }
)

const StudentCounselingFeedbackSchema = new Schema(
  {
    'rate-session': { rating: Number },
    'session-goal': String,
    'coach-ratings': {
      'coach-knowedgable': Number,
      'coach-friendly': Number,
      'coach-help-again': Number,
    },
    'other-feedback': String,
  },
  { _id: false }
)

const VolunteerFeedbackSchema = new Schema(
  {
    'session-enjoyable': Number,
    'session-improvements': String,
    'student-understanding': Number,
    'session-obstacles': {
      type: [Number],
      default: undefined,
    },
    'other-feedback': String,
  },
  { _id: false }
)

const feedbackSchema = new Schema({
  versionNumber: Number,

  sessionId: {
    type: Types.ObjectId,
  },

  type: {
    type: String,
    default: '',
  },

  subTopic: {
    type: String,
    default: '',
  },

  responseData: ResponseDataSchema,

  userType: {
    type: String,
    default: '',
  },

  studentId: {
    type: Types.ObjectId,
  },

  volunteerId: {
    type: Types.ObjectId,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  studentTutoringFeedback: StudentTutoringFeedbackSchema,

  studentCounselingFeedback: StudentCounselingFeedbackSchema,

  volunteerFeedback: VolunteerFeedbackSchema,
})

const FeedbackModel = model<FeedbackDocument>('Feedback', feedbackSchema)

export default FeedbackModel
