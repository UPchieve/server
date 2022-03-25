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

async function createQuizAction(
  action: QUIZ_USER_ACTIONS,
  userId: Ulid,
  ipAddressId: Ulid,
  quizSubcategory: keyof Certifications
) {
  try {
    await pgQueries.createQuizAction.run(
      {
        action,
        action_type: USER_ACTION_TYPES.QUIZ,
        ip_address_id: ipAddressId,
        quiz_category: getSubjectType(quizSubcategory).toUpperCase(),
        quiz_subcategory: (quizSubcategory as string).toUpperCase(),
        user_id: userId,
      },
      client
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

async function createSessionAction(
  action: SESSION_USER_ACTIONS,
  userId: Ulid,
  sessionId: Ulid,
  ipAddressId?: Ulid,
  device?: string,
  browser?: string,
  browserVersion?: string,
  operatingSystem?: string,
  operatingSystemVersion?: string
) {
  try {
    await pgQueries.createSessionAction.run(
      {
        action,
        action_type: USER_ACTION_TYPES.SESSION,
        browser: browser ? browser : null,
        browser_version: browserVersion ? browserVersion : null,
        device: device ? device : null,
        ip_address_id: ipAddressId ? ipAddressId : null,
        operating_system: operatingSystem ? operatingSystem : null,
        operating_system_version: operatingSystemVersion
          ? operatingSystemVersion
          : null,
        session_id: sessionId,
        user_id: userId,
      },
      client
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

async function createAccountAction(
  action: ACCOUNT_USER_ACTIONS,
  userId: Ulid,
  ipAddressId?: Ulid,
  volunteerId?: Ulid,
  sessionId?: Ulid,
  referenceEmail?: string
) {
  try {
    await pgQueries.createAccountAction.run(
      {
        action,
        action_type: USER_ACTION_TYPES.ACCOUNT,
        ip_address_id: ipAddressId ? ipAddressId : null,
        reference_email: referenceEmail ? referenceEmail : null,
        session_id: sessionId ? sessionId : null,
        user_id: userId,
        volunteer_id: volunteerId ? volunteerId : null,
      },
      client
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

async function createAdminAction(action: ACCOUNT_USER_ACTIONS, userId: Ulid) {
  try {
    await pgQueries.createAdminAction.run(
      {
        action,
        action_type: USER_ACTION_TYPES.ADMIN,
        user_id: userId,
      },
      client
    )
  } catch (err) {
    throw new RepoCreateError(err)
  }
}
