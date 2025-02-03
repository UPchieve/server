import Redis from 'ioredis'
import config from '../config'
import logger from '../logger'

export const redisClient = new Redis(config.redisConnectionString)

redisClient.on('connect', args => {
  logger.info('REDIS CONNECT: ' + args)
})
redisClient.on('ready', args => {
  logger.info('REDIS READY: ' + args)
})
redisClient.on('error', args => {
  logger.info('REDIS ERROR: ' + args)
})
redisClient.on('close', args => {
  logger.info('REDIS CLOSE: ' + args)
})
redisClient.on('reconnecting', args => {
  logger.info('REDIS RECONNECTING: ' + args)
})
redisClient.on('end', args => {
  logger.info('REDIS END: ' + args)
})
redisClient.on('wait', args => {
  logger.info('REDIS WAIT: ' + args)
})
redisClient.on('select', args => {
  logger.info('REDIS SELECT: ' + args)
})
