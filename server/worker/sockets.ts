import io from 'socket.io-client'
import config from '../config'
import { log } from './logger'

// https://socket.io/docs/v2/client-initialization - "From a different domain" section
const socket = io(config.socketAddress, {
  query: `key=${config.socketApiKey}`,
  autoConnect: false,
})

socket.on('connect', (socket: SocketIOClient.Socket) => {
  log('Worker socket connected')
})

export function startSocket(): void {
  socket.connect()
}

export default socket
