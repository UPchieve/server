import io from 'socket.io-client'
import config from '../config'
import logger from '../logger'

async function main() {
  // https://socket.io/docs/v2/client-initialization - "From a different domain" section
  const socket = io(config.socketAddress)
  socket.on('connect', () => {
    logger.info('Connected')
    socket.emit('eventFromScript', 'Test test')
  })
}

main()

// To run script
// npx ts-node server/scripts/test-sockets.ts
