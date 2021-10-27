import { Types } from 'mongoose'
import FeedbackModel, {
  Feedback,
  FeedbackVersionOne,
  FeedbackVersionTwo,
} from './index'
import { RepoReadError } from '../Errors'

export type AnyFeedback = Feedback | FeedbackVersionOne | FeedbackVersionTwo

/**
 * Gets version 2 feedback associated with a session from both the student
 * and volunteer.
 *
 * @param sessionId {Types.ObjectId} session whose Feedback we want
 * @returns feedback {FeedbackVersionTwo} a feedback object containing student and volunteer feedback associated with the session
 */
export async function getFeedbackV2BySessionId(
  sessionId: Types.ObjectId
): Promise<AnyFeedback | undefined> {
  try {
    const [feedback] = await FeedbackModel.aggregate([
      {
        $match: {
          sessionId,
          versionNumber: 2,
          $and: [
            {
              $or: [
                { studentCounselingFeedback: { $ne: null } },
                { studentCounselingFeedback: { $exists: false } },
              ],
            },
            {
              $or: [
                { studentTutoringFeedback: { $ne: null } },
                { studentTutoringFeedback: { $exists: false } },
              ],
            },
            {
              $or: [
                { volunteerFeedback: { $ne: null } },
                { volunteerFeedback: { $exists: false } },
              ],
            },
          ],
        },
      },
      {
        $group: {
          _id: null,
          root: { $mergeObjects: '$$ROOT' },
        },
      },
      {
        $replaceRoot: {
          newRoot: '$root',
        },
      },
    ])
    if (feedback) return feedback as AnyFeedback
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getFeedbackById(
  feedbackId: Types.ObjectId
): Promise<AnyFeedback | undefined> {
  try {
    const feedback = await FeedbackModel.findOne({ _id: feedbackId })
      .lean()
      .exec()
    if (feedback) return feedback as AnyFeedback
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getFeedbackBySessionIdUserType(
  sessionId: Types.ObjectId,
  userType: string
): Promise<AnyFeedback | undefined> {
  try {
    const feedback = await FeedbackModel.findOne({ sessionId, userType })
      .lean()
      .exec()
    if (feedback) return feedback as AnyFeedback
  } catch (err) {
    throw new RepoReadError(err)
  }
}
