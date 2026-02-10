import { AccessToken } from 'livekit-server-sdk'
import config from '../config'
import logger from '../logger'
import { Ulid } from '../models/pgUtils'
import { UserContactInfo } from '../models/User'
import * as SessionService from './SessionService'

export type Jwt = string
export type Url = string

export async function getRoomToken(
  user: UserContactInfo,
  sessionId: Ulid
): Promise<{ token: Jwt; url: Url } | undefined> {
  try {
    const session = await SessionService.ensureCanJoinSession(user, sessionId)
    if (!session) return

    const at = new AccessToken(
      config.livekit.apiKey,
      config.livekit.apiSecret,
      {
        identity: user.id,
      }
    )
    at.addGrant({
      room: sessionId,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    })

    return {
      token: await at.toJwt(),
      url: config.livekit.url,
    }
  } catch (err) {
    logger.error({ err }, 'Unable to create access token for live media room.')
  }
}
