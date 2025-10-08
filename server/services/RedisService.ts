import Redis from 'ioredis'
import config from '../config'
import { createSlackAlert } from '../services/SlackAlertService'

export const redisClient = new Redis(config.redisConnectionString)
// Enable Keyspace Notifications for expired events
// this let's us run a callback when a cache key expires

export const redisSubClient = new Redis(config.redisConnectionString)

export const EXPIRED_KEY_CHANNEL = '__keyevent@0__:expired'
const EVICTED_KEY_CHANNEL = '__keyevent@0__:evicted'

// Subscribe to the expiration channel
redisSubClient.subscribe(EXPIRED_KEY_CHANNEL)

// Subscribe to eviction events
redisSubClient.subscribe(EVICTED_KEY_CHANNEL)

redisSubClient.on('message', async (channel, key) => {
  if (channel == EVICTED_KEY_CHANNEL) {
    await createSlackAlert('Evicted Key Alert', `${key} was evicted`)
  }
})
