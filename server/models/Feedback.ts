import { Document, model, Schema, Types } from 'mongoose'

export interface Feedback {
  _id: Types.ObjectId
  sessionId: Types.ObjectId
  type: string
  subTopic: string
  responseData: { [key: string]: any } // eslint-disable-line @typescript-eslint/no-explicit-any
  userType: string
  studentId: Types.ObjectId
  volunteerId: Types.ObjectId
  createdAt: Date
}

export type FeedbackDocument = Feedback & Document

const feedbackSchema = new Schema({
  sessionId: {
    type: Types.ObjectId
  },

  type: {
    type: String,
    default: ''
  },

  subTopic: {
    type: String,
    default: ''
  },

  /**
   * Keys found when a student submits a feedback form for a
   * a math or science tutoring session: (Current)
   *
   * session-goal: number
   * subject-understanding: number
   * coach-rating: number
   * coach-feedback: string
   * other-feedback: string
   *
   *
   * Keys found when a volunteer submits a feedback form: (Current)
   *
   * session-enjoyable: number
   * session-improvements: string
   * student-understanding: number (volunteer counter-part of subject-understanding)
   * session-obstacles: number[]
   * other-feedback: string
   *
   *
   * Keys found when a student submits a feedback form for a
   * college counseling session: (Current)
   *
   * rate-session: { rating: number }
   * session-goal: string
   * coach-ratings: {
   *    coach-knowedgable: number,
   *    coach-friendly: number,
   *    coach-help-again: number
   * }
   * other-feedback: string
   *
   *
   * Old volunteer feedback form submission:
   *
   * rate-session: { rating: number }
   * session-experience: { (Deprecated)
   *    easy-to-answer-questions: number,
   *    feel-like-helped-student: number,
   *    feel-more-fulfilled: number,
   *    good-use-of-time: number,
   *    plan-on-volunteering-again: number
   * }
   * other-feedback: string
   *
   *
   * Below are the deprecated keys:
   *
   * rate-upchieve: {
   *    achieve-goal: number,
   *    easy-to-use: number,
   *    get-help-faster: number,
   *    use-next-time: number,
   * }
   * rate-coach: {
   *    achieve-goal: number
   *    find-help: number,
   *    knowledgeable: number,
   *    nice: number,
   *    want-him/her-again: number,
   * }
   * technical-difficulties: string,
   * asked-unprepared-questions: string,
   * app-features-needed: string
   *
   *
   */
  responseData: {
    type: Object,
    default: ''
  },

  userType: {
    type: String,
    default: ''
  },

  studentId: {
    type: Types.ObjectId
  },

  volunteerId: {
    type: Types.ObjectId
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
})

const FeedbackModel = model<FeedbackDocument>('Feedback', feedbackSchema)

module.exports = FeedbackModel
export default FeedbackModel
