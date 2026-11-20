import { createSigner } from 'fast-jwt'
import type { CookieOptions } from 'express'
import { NotAllowedError } from '../models/Errors'
import type { Ulid } from '../models/pgUtils'
import logger from '../logger'
import config from '../config'
import * as SessionService from './SessionService'
import { isProductionEnvironment } from '../utils/environments'
import { isSessionParticipant } from '../utils/session-utils'
import { minutesInMs } from '../utils/time-utils'

export const WHITEBOARD_COOKIE_NAME = 'whiteboard_token'
export const WHITEBOARD_TOKEN_TTL_MS = minutesInMs(60)

type WhiteboardTokenClaims = {
  sessionId: Ulid
  sub: Ulid
}

export async function ensureUserCanJoinWhiteboard(
  userId: Ulid,
  sessionId: Ulid
): Promise<void> {
  const session = await SessionService.getCurrentSessionById(sessionId)

  if (session.endedAt) {
    logger.warn('Unauthorized whiteboard join attempt', {
      userId,
      sessionId,
      reason: 'ended_session',
    })
    throw new NotAllowedError('Not authorized to access this whiteboard')
  }

  if (isSessionParticipant(session.studentId, session.volunteerId, userId)) {
    return
  }

  logger.warn('Unauthorized whiteboard join attempt', {
    userId,
    sessionId,
    reason: 'not_session_participant',
  })
  throw new NotAllowedError('Not authorized to access this whiteboard')
}

export async function getWhiteboardToken(
  userId: Ulid,
  sessionId: Ulid
): Promise<{ token: string; expiresAt: string }> {
  await ensureUserCanJoinWhiteboard(userId, sessionId)

  const claims: WhiteboardTokenClaims = { sessionId, sub: userId }
  const expiresAt = new Date(Date.now() + WHITEBOARD_TOKEN_TTL_MS).toISOString()

  const sign = createSigner({
    key: config.whiteboardTokenPrivateKey,
    algorithm: 'EdDSA',
    expiresIn: WHITEBOARD_TOKEN_TTL_MS,
    iss: 'subway',
    aud: 'graffiti',
  })

  return { token: sign(claims), expiresAt }
}

export function getWhiteboardCookieOptions(sessionId: Ulid): CookieOptions {
  return {
    httpOnly: true,
    secure: isProductionEnvironment(),
    sameSite: 'strict',
    maxAge: WHITEBOARD_TOKEN_TTL_MS,
    path: `/graffiti/whiteboard/room/${sessionId}`,
  }
}
