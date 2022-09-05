import pino from 'pino'
import config from './config'

const logger = pino({
  level: config.logLevel,
})

export default logger
module.exports = logger
