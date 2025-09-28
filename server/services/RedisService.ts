import Redis from 'ioredis'
import config from '../config'

export const redisClient = new Redis(config.redisConnectionString)
// Enable Keyspace Notifications for expired events
// this let's us run a callback when a cache key expires

export const redisSubClient = new Redis(config.redisConnectionString)

export const EXPIRED_KEY_CHANNEL = '__keyevent@0__:expired'
// Subscribe to the expiration channel
redisSubClient.subscribe(EXPIRED_KEY_CHANNEL)
