import logger from '../logger'
import {
  ACCOUNT_USER_ACTIONS,
  USER_BAN_REASONS,
  USER_BAN_TYPES,
  UserSessionFlags,
} from '../constants'
import { Ulid } from '../models/pgUtils'
import * as SessionRepo from '../models/Session'
import * as UsersRepo from '../models/User'
import { createAccountAction } from '../models/UserAction'
import SocketService from './SocketService'
import * as SessionService from './SessionService'
import { runInTransaction, TransactionClient } from '../db'

export async function liveMediaBanUser(
  userId: string,
  sessionId: string,
  tc?: TransactionClient
): Promise<void> {
  await runInTransaction(async (tc) => {
    // TODO: Do we want to blindly overwrite with live media ban?
    // A user can only have one ban type at a time (users.ban_type), so this
    // will technically overwrite an existing ban, like a shadow ban.
    await UsersRepo.banUserById(
      userId,
      USER_BAN_TYPES.LIVE_MEDIA,
      USER_BAN_REASONS.AUTOMATED_MODERATION,
      tc
    )
    await SessionService.markSessionForReview(
      sessionId,
      [UserSessionFlags.liveMediaBan],
      tc
    )
  }, tc)
  await SocketService.getInstance().emitUserLiveMediaBannedEvents(
    userId,
    sessionId
  )
}

/**
 * Removes the live media ban for the user's partner in the current session.
 * Only a live media ban can be cleared. If the partner has a shadow/complete
 * ban, do not overwrite.
 */
export async function removePartnerLiveMediaBan(
  userId: Ulid
): Promise<string | undefined> {
  try {
    const { partnerId, sessionId } =
      await ensureCanRemoveLiveMediaBanForPartner(userId)
    if (!partnerId) {
      return
    }

    const wasRemoved = await UsersRepo.removeLiveMediaBanById(partnerId)
    if (!wasRemoved) {
      return
    }

    await createAccountAction({
      userId: partnerId,
      sessionId,
      action: ACCOUNT_USER_ACTIONS.LIVE_MEDIA_BAN_REMOVED,
    })

    return sessionId
  } catch (err) {
    logger.error('Failed to remove partner live media ban', {
      err,
    })
  }
}

async function ensureCanRemoveLiveMediaBanForPartner(userId: Ulid) {
  const session = await SessionRepo.getCurrentSessionByUserId(userId)
  if (!session) {
    return {}
  }

  const partnerId =
    userId === session.studentId ? session.volunteerId : session.studentId
  if (!partnerId) {
    return {}
  }

  return { partnerId, sessionId: session.id }
}
