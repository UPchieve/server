import io from 'socket.io-client'
import config from '../config'
import { log } from './logger'

// https://socket.io/docs/v2/client-initialization - "From a different domain" section
const socket = io(config.socketAddress, { query: `key=${config.socketApiKey}` })

// TODO: reconnect if server not up when worker is started

socket.on('connect', (socket: SocketIOClient.Socket) => {
  log('Worker socket connected')
})

export default socket
