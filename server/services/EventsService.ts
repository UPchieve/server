import Merkury from 'merkury'
import { v4 as uuidv4 } from 'uuid'
import config from '../config'

interface RedisConfig {
  host: string
  port: string
  password?: string
  tls?: {}
}

let redisConfig: RedisConfig = {
  host: config.redisHost,
  port: config.redisPort,
  password: config.redisPassword,
  tls: {}
}
if (config.NODE_ENV === 'dev')
  redisConfig = {
    host: config.redisHost,
    port: config.redisPort
  }

export const emitter = new Merkury(uuidv4(), redisConfig, true)
