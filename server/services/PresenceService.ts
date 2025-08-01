import { ACCOUNT_USER_ACTIONS } from '../constants'
import logger from '../logger'
import { Ulid } from '../models/pgUtils'
import {
  redisSubClient,
  redisClient,
  EXPIRED_KEY_CHANNEL,
} from './RedisService'
import * as UserActionService from './UserActionService'

const PRESENCE_TTL_IN_SECONDS = 120
const PRESENCE_KEY_PREFIX = 'user-presence'
const PRESENCE_KEY_MATCH = new RegExp(
  `^(${PRESENCE_KEY_PREFIX}:)?([^:]+):([^:]+)$`
)

redisSubClient.on('message', exipredKeyListener)

function expiredKeyIsPresenceKey(channel: string, expiredKey: string) {
  return channel === EXPIRED_KEY_CHANNEL && PRESENCE_KEY_MATCH.test(expiredKey)
}

function exipredKeyListener(channel: string, expiredKey: string) {
  if (expiredKeyIsPresenceKey(channel, expiredKey)) {
    console.log(`key expired: ${expiredKey}`)
    const [_, userId, clientUUID] = expiredKey.split(':')
    trackInactive({ userId, clientUUID })
  }
}

function makeKey(userId: string, clientUUID: string) {
  return `${PRESENCE_KEY_PREFIX}:${userId}:${clientUUID}`
}

export async function trackActive({
  userId,
  userAgent,
  ipAddress,
  clientUUID,
}: {
  userId: Ulid
  clientUUID: string
  // NOTE: if there's no userAgent or ipAddress,
  // they are inactive because they presence key expired
  userAgent: string
  ipAddress: string
}) {
  /*
   *  example:
   *  1. high-line session created UUID 123 and sent to /user/track-presence/active
   *  2. trackActive({UUID: 123}) // great, this is good
   *  3. high-line session loses network connectivity // this is bad
   *  4. 2 minutes later, redis key expires, we add ACCOUNT_USER_ACTIONS.INACTIVE_ON_SITE user action
   *  5. 1 minute later, high-line is back online and pings with UUID 123
   *  6. we create a new redis key, we add ACCOUNT_USER_ACTIONS.ACTIVE_ON_SITE // this is good!
   *
   *  This lets us handle multiple devices online at the same time BUT...
   *  it means we need to store clientUUID (and continue widen the user_actions table :cry:)
   *  so that we can match up ACTIVE_ON_SITE and INACTIVE_ON_SITE actions
   */
  const key = makeKey(userId, clientUUID)
  const keyExists = await redisClient.get(key)
  if (keyExists) {
    console.log('track key exists', key)
  }
  if (!keyExists) {
    console.log('track key does not exist', key)
    const params = {
      action: ACCOUNT_USER_ACTIONS.ACTIVE_ON_SITE,
      userId,
      clientUUID,
      userAgent,
      ipAddress,
    }
    UserActionService.createAccountAction(params)
  }

  // always `set` either it overwrites an existing key with the new TTL
  // or it creates it for the first time
  // setting 1 as the value. we never read it but we need a value
  redisClient.set(key, 1, 'EX', PRESENCE_TTL_IN_SECONDS)
}

export async function trackInactive({
  userId,
  userAgent,
  ipAddress,
  clientUUID,
}: {
  userId: Ulid
  clientUUID: string
  // NOTE: if there's no userAgent or ipAddress,
  // they are inactive because they presence key expired
  userAgent?: string
  ipAddress?: string
}) {
  const key = makeKey(userId, clientUUID)
  const deletedKeyCount = await redisClient.del(key)
  console.log('del return', deletedKeyCount)
  if (deletedKeyCount === 1) {
    console.log('track key deleted', key)
    const params = {
      action: ACCOUNT_USER_ACTIONS.INACTIVE_ON_SITE,
      userId,
      clientUUID,
      userAgent,
      ipAddress,
    }
    UserActionService.createAccountAction(params)
  } else {
    // This can happen if the browser has paused js execution (tab is suspended)
    // and then resumes later (tab unsuspended)
    // probably not anything to worry about but getting a lot of these
    // might mean something is broken
    logger.warn(
      {
        userId,
        userAgent,
        ipAddress,
        clientUUID,
      },
      `No cache key ${key} was found when attempting to set user as INACTIVE_ON_SITE.`
    )
  }
}
