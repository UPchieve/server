import io from 'socket.io-client'
import config from '../config'

import axios from 'axios'

async function main() {
  let exitCode = 0
  try {
    const res = await axios({
      method: 'post',
      url: 'localhost:3000/auth/login',
      data: {
        email: 'CHATBOT@example.com',
        password: 'Password123'
      }
    })
    console.log('Login response: ', res)

    // https://socket.io/docs/v2/client-initialization - "From a different domain" section
    const socket = io(config.socketAddress)
    console.log('Attempting to connect to socket')
    socket.on('connect', () => {
      console.log('Connected!!')
      socket.emit('eventFromScript', 'helloo')
    })
    await new Promise(res => setTimeout(() => {}, 500000))
  } catch (err) {
    exitCode = 1
    console.error(`Unhandled error: ${err}`)
  } finally {
    process.exit(exitCode)
  }
}

main()

// To run script
// npx ts-node server/scripts/test-sockets.ts
