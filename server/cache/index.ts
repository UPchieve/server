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

const redisClient = new Redis(config.redisConnectionString)

export class KeyNotFoundError extends CustomError {
  constructor(attemptedKey: string) {
    super(`key ${attemptedKey} was not found in the cache`)
  }
}

export async function save(key, value: string) {
  await redisClient.set(key, value)
}

/**
 *
 * @param key
 * @param value
 * @param seconds defaults to 1 day
 */
export async function saveWithExpiration(key, value: string, seconds = 86400) {
  // possible expiryMode values: https://redis.io/commands/set
  await redisClient.set(key, value, 'EX', seconds)
}

export async function getTimeToExpiration(key: string) {
  return redisClient.ttl(key)
}

export async function get(key: string): Promise<string> {
  const value = await redisClient.get(key)
  if (value === null) {
    throw new KeyNotFoundError(key)
  }
  return value
}

export async function remove(key: string) {
  await redisClient.del(key)
}
