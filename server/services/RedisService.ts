import Redis from 'ioredis'
import config from '../config'

export const redisClient = new Redis(config.redisConnectionString)

export const socketIoPubClient = new Redis(config.redisConnectionString)

export const socketIoSubClient = new Redis(config.redisConnectionString)
