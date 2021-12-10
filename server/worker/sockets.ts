import io from 'socket.io-client'
import config from '../config'
import logger from '../logger'

// https://socket.io/docs/v2/client-initialization - "From a different domain" section
const socket = io(config.socketAddress, {
  query: `key=${config.socketApiKey}`,
  autoConnect: false,
  reconnectionDelay: 3000,
  reconnection: true,
  transports: ['websocket'],
  agent: false,
  upgrade: false,
})

socket.on('connect', () => {
  logger.info('Worker socket connected')
})

socket.on('connect_error', (error: Error) => {
  logger.info(`Worker socket connection error: ${error}`)
})

socket.on('error', (error: Error) => {
  logger.debug(`Worker socket error: ${error}`)
})

export function startSocket(): void {
  socket.connect()
}

export default socket
