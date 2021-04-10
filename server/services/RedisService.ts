import Redis from 'ioredis'
import config from '../config'

export const redisClient = new Redis({
  host: config.redisHost,
  port: config.redisPort,
  password: config.redisPassword,
  tls: config.redisUseTls
})

export const socketIoPubClient = new Redis({
  host: config.redisHost,
  port: config.redisPort,
  password: config.redisPassword,
  tls: config.redisUseTls
})

export const socketIoSubClient = new Redis({
  host: config.redisHost,
  port: config.redisPort,
  password: config.redisPassword,
  tls: config.redisUseTls
})
