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
  // possible expiryMode values: https://redis.io/commands/set
  await redisClient.set(key, value, 'EX', seconds)
}

export async function getTimeToExpiration(key: string): Promise<number> {
  return await redisClient.ttl(key)
}

export async function get(key: string): Promise<string> {
  const value = await redisClient.get(key)
  if (value === null) {
    throw new KeyNotFoundError(key)
  }
  return value
}

export async function remove(key: string): Promise<void> {
  const docsRemoved = await redisClient.del(key)
  if (docsRemoved === 0) throw new KeyDeletionFailureError(key)
}

export async function append(key: string, addition: string): Promise<void> {
  const docLength = await redisClient.append(key, addition)
  if (docLength === 0) throw new AppendLengthZeroError(key)
}

export async function rpush(key: string, addition: string): Promise<number> {
  return await redisClient.rpush(key, [addition])
}

export async function lpop(key: string): Promise<string> {
  return await redisClient.lpop(key)
}

export async function lock(key: string, lockDuration: number): Promise<Lock> {
  return await redisLock.lock(`lock:${key}`, lockDuration)
}
