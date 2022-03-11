import { Types } from 'mongoose'
import { RepoReadError } from '../Errors'
import UserActionModel, { UserAction, UserActionAgent } from '../UserAction'
import { USER_ACTION } from '../../constants'

// TODO: this should not be used - make a custom getter if pipeline is needed
export async function getActionsWithPipeline(
  pipeline: any
): Promise<UserAction[]> {
  return (await UserActionModel.aggregate(pipeline)) as UserAction[]
}

export async function getQuizzesPassedForDateRange(
  volunteerId: Types.ObjectId,
  fromDate: Date,
  toDate: Date
): Promise<UserAction[]> {
  try {
    return (await UserActionModel.find({
      user: volunteerId,
      createdAt: {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      },
      action: USER_ACTION.QUIZ.PASSED,
    })
      .lean()
      .exec()) as UserAction[]
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSessionRequestedUserAgentFromSessionId(
  sessionId: Types.ObjectId
): Promise<UserActionAgent | undefined> {
  try {
    const doc = await UserActionModel.findOne({
      session: sessionId,
      action: USER_ACTION.SESSION.REQUESTED,
    })
      .select(
        '-_id device browser browserVersion operatingSystem operatingSystemVersion'
      )
      .lean()
      .exec()
    if (!doc) return undefined
    return {
      device: doc.device,
      browser: doc.browser,
      browserVersion: doc.browserVersion,
      operatingSystem: doc.operatingSystem,
      operatingSystemVersion: doc.operatingSystemVersion,
    } as UserActionAgent
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// if a user has completed any quizzes they would have had to either pass or fail
// so checking an or on that should tell us if they've ever finished a quiz before
// this is used to determine if we should send them an email when they fail
// which we only want to do if they've failed the first quiz they've ever attempted
export async function userHasTakenQuiz(
  userId: Types.ObjectId
): Promise<boolean> {
  try {
    const docs: any[] = await UserActionModel.aggregate([
      {
        $match: {
          $and: [
            { user: userId },
            {
              $or: [
                { action: USER_ACTION.QUIZ.PASSED },
                { action: USER_ACTION.QUIZ.FAILED },
              ],
            },
          ],
        },
      },
    ]).exec()
    return docs.length !== 0
  } catch (err) {
    throw new RepoReadError(err)
  }
}

// pg wrappers
import { getClient } from '../../pg'
import * as pgQueries from './pg.queries'
import { Ulid, makeRequired } from '../pgUtils'

const client = getClient()

export async function getQuizzesPassedForDateRangeById(
  userId: Ulid,
  start: Date,
  end: Date
): Promise<number> {
  try {
    const result = await pgQueries.getQuizzesPassedForDateRangeById.run(
      { userId, start, end },
      client
    )
    if (result.length) return makeRequired(result[0]).total
    return 0
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function IgetSessionRequestedUserAgentFromSessionId(
  sessionId: Ulid
): Promise<UserActionAgent | undefined> {
  try {
    const result = await pgQueries.getSessionRequestedUserAgentFromSessionId.run(
      { sessionId },
      client
    )
    if (result.length) return makeRequired(result[0])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function IuserHasTakeQuiz(userId: Ulid): Promise<boolean> {
  try {
    const result = await pgQueries.userHasTakenQuiz.run({ userId }, client)
    if (result.length) return makeRequired(result[0]).exists
    return false
  } catch (err) {
    throw new RepoReadError(err)
  }
}
