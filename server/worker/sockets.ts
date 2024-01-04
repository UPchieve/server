import { io } from 'socket.io-client'
import config from '../config'
import logger from '../logger'

/*
 * transport/upgrade options: https://github.com/socketio/socket.io-client/issues/1097
 */

let protocol
if (config.NODE_ENV === 'dev') {
  protocol = 'http'
} else {
  protocol = 'https'
}

const port = config.NODE_ENV === 'dev' ? `:${config.socketsPort}` : ''
const socketUri = `${protocol}://${config.clusterServerAddress}${port}`
const socket = io(socketUri, {
  query: { key: config.socketApiKey },
  autoConnect: false,
  reconnection: true,
  transports: ['websocket'],
  upgrade: false,
})

socket.on('connect', () => {
  logger.info('Worker socket connected')
})

socket.on('connect_error', error => {
  logger.error(`Worker socket connection error: ${error.message} - ${error}`)
})

socket.on('disconnect', reason => {
  logger.warn(`Worker socket disconnected: ${reason}`)
})

socket.on('reconnect_attempt', () => {
  logger.info(`Worker socket attempting to reconnect`)
})

socket.on('reconnect_failed', () => {
  logger.error('Worker socket failed to reconnect')
})

socket.on('reconnect_error', error => {
  logger.error(`Worker socket reconnection error: ${error.message} - ${error}`)
})

socket.on('error', error => {
  logger.error(`Worker socket general error: ${error.message} - ${error}`)
})

export function getSocket() {
  return socket
}

export function startSocket(): void {
  socket.connect()
}
