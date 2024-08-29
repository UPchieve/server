/**
 * Cache
 * @module cache
 * The cache module is a wrapper around some fast key/value store,
 * (currently Redis).
 * It exposes a couple of CRUD type functions to abstract cache methods
 * so that if we want to swap the backend in the future we can do
 * so in one place.
 */

import Redis from 'ioredis'
import { CustomError } from 'ts-custom-error'
import config from '../config'
import redlock, { Lock } from 'redlock'
import logger from '../logger'

const redisClient = new Redis(config.redisConnectionString)

const redisLock = new redlock([redisClient])

// TODO: we should just return undefiend on KeyNotFound
export class KeyNotFoundError extends CustomError {
  constructor(attemptedKey: string) {
    super(`key ${attemptedKey} was not found in the cache`)
  }
}

export class AppendLengthZeroError extends CustomError {
  constructor(attemptedKey: string) {
    super(`length of doucment ${attemptedKey} after append was 0`)
  }
}

export class KeyDeletionFailureError extends CustomError {
  constructor(attemptedKey: string) {
    super(`deletion of key ${attemptedKey} failed`)
  }
}

export async function save(key: string, value: string): Promise<void> {
  logger.info(`Redis saving key ${key} with value of length ${value.length}`)
  await redisClient.set(key, value)
}

/**
 *
 * @param key
 * @param value
 * @param seconds defaults to 1 day
 */
export async function saveWithExpiration(
  key: string,
  value: string,
  seconds = 86400
): Promise<void> {
  logger.info(`Redis saving key ${key} with expiration of ${seconds} seconds`)
  // possible expiryMode values: https://redis.io/commands/set
  await redisClient.set(key, value, 'EX', seconds)
}

export async function getTimeToExpiration(key: string): Promise<number> {
  return await redisClient.ttl(key)
}

export async function get(key: string): Promise<string> {
  logger.info(`Redis getting key ${key}`)
  const value = await redisClient.get(key)
  if (value === null) {
    logger.warn(`Redis key not found: ${key}`)
    throw new KeyNotFoundError(key)
  }
  return value
}

export async function remove(key: string): Promise<number> {
  logger.info(`Redis removing key ${key}`)
  return await redisClient.del(key)
}

export async function append(key: string, addition: string): Promise<void> {
  logger.info(
    `Redis appending to key ${key} with addition of length ${addition.length}`
  )
  const docLength = await redisClient.append(key, addition)
  if (docLength === 0) throw new AppendLengthZeroError(key)
}

export async function rpush(key: string, addition: string): Promise<number> {
  logger.info(`Redis pushing to key ${key}`)
  return await redisClient.rpush(key, [addition])
}

export async function lpop(key: string): Promise<string> {
  logger.info(`Redis popping from key ${key}`)
  return await redisClient.lpop(key)
}

export async function lock(key: string, lockDuration: number): Promise<Lock> {
  logger.info(`Redis locking key ${key} for ${lockDuration} ms`)
  return await redisLock.lock(`lock:${key}`, lockDuration)
}

export async function sadd(key: string, member: string) {
  logger.info(`Redis adding member to set key ${key}`)
  return await redisClient.sadd(key, member)
}

export async function smembers(key: string) {
  logger.info(`Redis fetching members of set key ${key}`)
  return await redisClient.smembers(key)
}

redisClient.on('connect', () => {
  logger.info('Redis client connected')
})

redisClient.on('ready', () => {
  logger.info('Redis client ready')
})

redisClient.on('end', () => {
  logger.warn('Redis client connection closed')
})

redisClient.on('reconnecting', time => {
  logger.warn(`Redis client reconnecting in ${time}ms`)
})

redisClient.on('error', error => {
  logger.error('Redis client error:', error)
})
