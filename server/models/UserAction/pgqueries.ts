import { getClient } from '../../pg'
import * as pgQueries from './pg.queries'
import { Ulid, makeRequired } from '../pgUtils'
import { RepoReadError, RepoCreateError } from '../Errors'
import { UserActionAgent } from './index'
import {
  QUIZ_USER_ACTIONS,
  SESSION_USER_ACTIONS,
  ACCOUNT_USER_ACTIONS,
  USER_ACTION_TYPES,
} from '../../constants'
import { Certifications } from '../Volunteer'
import { getSubjectType } from '../../utils/getSubjectType'

const client = getClient()

export async function getQuizzesPassedForDateRangeById(
  userId: Ulid,
  start: Date,
  end: Date
): Promise<number> {
  try {
    const result = await pgQueries.getQuizzesPassedForDateRangeByVolunteerId.run(
      { userId, start, end },
      client
    )
    if (result.length) return makeRequired(result[0]).total
    return 0
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getSessionRequestedUserAgentFromSessionId(
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

export async function userHasTakeQuiz(userId: Ulid): Promise<boolean> {
  try {
    const result = await pgQueries.userHasTakenQuiz.run({ userId }, client)
    if (result.length) return makeRequired(result[0]).exists
    return false
  } catch (err) {
    throw new RepoReadError(err)
  }
}

/*
The following functions are differentiated, rather than having
one "createUserAction" function because they take different,
but consistent, arguments, per type of user action created.
*/

interface QuizActionParams {
  action: QUIZ_USER_ACTIONS
  quizSubcategory: keyof Certifications
  userId: Ulid
  ipAddressId?: Ulid
}

async function createQuizAction(params: QuizActionParams) {
  try {
    const result = await pgQueries.createQuizAction.run(
      {
        action: params.action,
        actionType: USER_ACTION_TYPES.QUIZ,
        ipAddressId: params.ipAddressId ? params.ipAddressId : null,
        quizCategory: getSubjectType(params.quizSubcategory).toUpperCase(),
        quizSubcategory: (params.quizSubcategory as string).toUpperCase(),
        userId: params.userId,
      },
      client
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new Error('insertion of quiz user action did not return ok')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

interface SessionActionParams {
  action: SESSION_USER_ACTIONS
  sessionId: Ulid
  userId: Ulid
  browser?: string
  browserVersion?: string
  device?: string
  ipAddressId?: Ulid
  operatingSystem?: string
  operatingSystemVersion?: string
}

async function createSessionAction(params: SessionActionParams) {
  try {
    const result = await pgQueries.createSessionAction.run(
      {
        action: params.action,
        actionType: USER_ACTION_TYPES.SESSION,
        browser: params.browser ? params.browser : null,
        browserVersion: params.browserVersion ? params.browserVersion : null,
        device: params.device ? params.device : null,
        ipAddressId: params.ipAddressId ? params.ipAddressId : null,
        operatingSystem: params.operatingSystem ? params.operatingSystem : null,
        operatingSystemVersion: params.operatingSystemVersion
          ? params.operatingSystemVersion
          : null,
        sessionId: params.sessionId,
        userId: params.userId,
      },
      client
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new Error('insertion of session user action did not return ok')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

interface AccountActionParams {
  action: ACCOUNT_USER_ACTIONS
  userId: Ulid
  ipAddressId?: Ulid
  referenceEmail?: string
  sessionId?: Ulid
  volunteerId?: Ulid
}

async function createAccountAction(params: AccountActionParams) {
  try {
    const result = await pgQueries.createAccountAction.run(
      {
        action: params.action,
        actionType: USER_ACTION_TYPES.ACCOUNT,
        ipAddressId: params.ipAddressId ? params.ipAddressId : null,
        referenceEmail: params.referenceEmail ? params.referenceEmail : null,
        sessionId: params.sessionId ? params.sessionId : null,
        userId: params.userId,
        volunteerId: params.volunteerId ? params.volunteerId : null,
      },
      client
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new Error('insertion of account user action did not return ok')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

async function createAdminAction(action: ACCOUNT_USER_ACTIONS, userId: Ulid) {
  try {
    const result = await pgQueries.createAdminAction.run(
      {
        action,
        actionType: USER_ACTION_TYPES.ADMIN,
        userId: userId,
      },
      client
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new Error('insertion of admin user action did not return ok')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
