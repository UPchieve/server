import { getClient, TransactionClient } from '../../db'
import * as pgQueries from './pg.queries'
import { Ulid, makeRequired, makeSomeOptional } from '../pgUtils'
import {
  RepoReadError,
  RepoCreateError,
  RepoUpdateError,
  RepoDeleteError,
} from '../Errors'
import { UserActionAgent, QuizzesPassedForDateRange } from './types'
import {
  ACCOUNT_USER_ACTIONS,
  QUIZ_USER_ACTIONS,
  SESSION_USER_ACTIONS,
  USER_ACTION_TYPES,
} from '../../constants'
import { getSubjectType } from '../Subjects'

export async function getQuizzesPassedForDateRangeById(
  userId: Ulid,
  start: Date,
  end: Date
): Promise<number> {
  try {
    const result = await pgQueries.getQuizzesPassedForDateRangeByVolunteerId.run(
      { userId, start, end },
      getClient()
    )
    if (result.length) return makeRequired(result[0]).total
    return 0
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function getQuizzesPassedForDateRangeForTelecomReportByVolunteerId(
  userId: Ulid,
  start: Date,
  end: Date
): Promise<QuizzesPassedForDateRange[]> {
  try {
    const result = await pgQueries.getQuizzesPassedForDateRangeForTelecomReportByVolunteerId.run(
      { userId, start, end },
      getClient()
    )
    if (result.length) return result.map(row => makeRequired(row))
    return []
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
      getClient()
    )
    if (result.length)
      return makeSomeOptional(result[0], [
        'browser',
        'browserVersion',
        'operatingSystemVersion',
        'operatingSystem',
      ])
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function userHasTakenQuiz(userId: Ulid): Promise<boolean> {
  try {
    const result = await pgQueries.userHasTakenQuiz.run({ userId }, getClient())
    if (result.length) return makeRequired(result[0]).exists
    return false
  } catch (err) {
    throw new RepoReadError(err)
  }
}

export async function upsertIpAddress(
  ip: string,
  tc: TransactionClient
): Promise<Ulid> {
  try {
    const result = await pgQueries.upsertIpAddress.run({ ip }, tc)
    if (!result.length) throw new Error('Error upserting IP address')
    return makeRequired(result[0]).id
  } catch (err) {
    throw new RepoUpdateError(err)
  }
}

/*
The following functions are differentiated, rather than having
one "createUserAction" function because they take different,
but consistent, arguments, per type of user action created.
*/

interface QuizActionParams {
  action: QUIZ_USER_ACTIONS
  quizSubcategory: string
  userId: Ulid
  ipAddress?: string
}

export async function createQuizAction(params: QuizActionParams) {
  const client = await getClient().connect()
  try {
    let ip = undefined
    if (params.ipAddress) ip = await upsertIpAddress(params.ipAddress, client)
    const subjectType = await getSubjectType(params.quizSubcategory)
    const result = await pgQueries.createQuizAction.run(
      {
        action: params.action,
        actionType: USER_ACTION_TYPES.QUIZ,
        ipAddressId: ip,
        quizCategory: subjectType ? subjectType.toUpperCase() : '',
        quizSubcategory: (params.quizSubcategory as string).toUpperCase(),
        userId: params.userId,
      },
      client
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new Error('insertion of quiz user action did not return ok')
  } catch (err) {
    throw new RepoCreateError(err)
  } finally {
    client.release()
  }
}

interface SessionActionParams {
  action: SESSION_USER_ACTIONS
  sessionId: Ulid
  userId: Ulid
  browser?: string
  browserVersion?: string
  device?: string
  ipAddress?: string
  operatingSystem?: string
  operatingSystemVersion?: string
}

export async function createSessionAction(params: SessionActionParams) {
  const client = await getClient().connect()
  try {
    let ip = undefined
    if (params.ipAddress) ip = await upsertIpAddress(params.ipAddress, client)
    const result = await pgQueries.createSessionAction.run(
      {
        action: params.action,
        actionType: USER_ACTION_TYPES.SESSION,
        browser: params.browser ? params.browser : null,
        browserVersion: params.browserVersion ? params.browserVersion : null,
        device: params.device ? params.device : null,
        ipAddressId: ip,
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
  } finally {
    client.release()
  }
}

interface AccountActionParams {
  action: ACCOUNT_USER_ACTIONS
  userId: Ulid
  ipAddress?: string
  referenceEmail?: string
  sessionId?: Ulid
  volunteerId?: Ulid
  banReason?: string
}

export async function createAccountAction(
  params: AccountActionParams,
  tc?: TransactionClient
) {
  const client = tc ?? (await getClient().connect())
  try {
    let ipId = undefined
    if (params.ipAddress) ipId = await upsertIpAddress(params.ipAddress, client)
    const result = await pgQueries.createAccountAction.run(
      {
        action: params.action,
        actionType: USER_ACTION_TYPES.ACCOUNT,
        ipAddressId: ipId,
        referenceEmail: params.referenceEmail
          ? params.referenceEmail.toLowerCase()
          : null,
        sessionId: params.sessionId ? params.sessionId : null,
        userId: params.userId,
        volunteerId: params.volunteerId ? params.volunteerId : null,
        banReason: params.banReason ? params.banReason : null,
      },
      client
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new Error('insertion of account user action did not return ok')
  } catch (err) {
    throw new RepoCreateError(err)
  } finally {
    // @ts-ignore
    if (!tc && client.release) client.release()
  }
}

export async function createAdminAction(
  action: ACCOUNT_USER_ACTIONS,
  userId: Ulid
) {
  try {
    const result = await pgQueries.createAdminAction.run(
      {
        action,
        actionType: USER_ACTION_TYPES.ADMIN,
        userId: userId,
      },
      getClient()
    )
    if (!(result.length && makeRequired(result[0]).ok))
      throw new Error('insertion of admin user action did not return ok')
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function deleteSelfFavoritedVolunteersActions(): Promise<void> {
  try {
    await pgQueries.deleteSelfFavoritedVolunteersActions.run(
      undefined,
      getClient()
    )
  } catch (err) {
    throw new RepoDeleteError(err)
  }
}
