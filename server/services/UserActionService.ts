import { Types, Aggregate } from 'mongoose'
import { USER_ACTION } from '../constants'
import UserActionModel, {
  UserAction,
  UserActionAgent
} from '../models/UserAction'

export const getActionsWithPipeline = (pipeline): Aggregate<UserAction[]> =>
  UserActionModel.aggregate(pipeline)

export const getQuizzesPassedForDateRange = (
  volunteerId: Types.ObjectId | string,
  fromDate: Date,
  toDate: Date
  // @todo: figure out how to properly type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> =>
  UserActionModel.find({
    user: volunteerId,
    createdAt: {
      $gte: new Date(fromDate),
      $lte: new Date(toDate)
    },
    action: USER_ACTION.QUIZ.PASSED
  })
    .lean()
    .exec()

// @todo: move to UserAction Repo
export async function getSessionRequestedUserAgentFromSessionId(sessionId) {
  let doc
  try {
    doc = await UserActionModel.findOne({
      session: sessionId,
      action: USER_ACTION.SESSION.REQUESTED
    })
      .select(
        '-_id device browser browserVersion operatingSystem operatingSystemVersion'
      )
      .lean()
      .exec()
    if (!doc) return null
    return {
      device: doc.device,
      browser: doc.browser,
      browserVersion: doc.browserVersion,
      operatingSystem: doc.operatingSystem,
      operatingSystemVersion: doc.operatingSystemVersion
    } as UserActionAgent
  } catch (error) {}
}

// if a user has completed any quizzes they would have had to either pass or fail
// so checking an or on that should tell us if they've ever finished a quiz before
// this is used to determine if we should send them an email when they fail
// which we only want to do if they've failed the first quiz they've ever attempted
export async function userHasTakenQuiz(userId: Types.ObjectId) {
  const docs: any[] = await UserActionModel.aggregate([
    {
      $match: {
        $and: [
          { user: userId },
          {
            $or: [
              { action: USER_ACTION.QUIZ.PASSED },
              { action: USER_ACTION.QUIZ.FAILED }
            ]
          }
        ]
      }
    }
  ]).exec()
  return docs.length !== 0
}
