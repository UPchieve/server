import pino from 'pino';

function newLogger() {
  let logger

  if (process.env.NODE_ENV === 'development') {
    logger = pino({ prettyPrint: {
      colorize: true,
    },
    level: 'debug',
  })
  } else {
    logger = pino({
      level: 'debug'
    })
  }

  return logger
}

const logger = newLogger()

export default logger
module.exports = logger
