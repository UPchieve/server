import io from 'socket.io-client'
import config from '../config'

async function main() {
  let exitCode = 0
  try {

    // https://socket.io/docs/v2/client-initialization - "From a different domain" section
    const socket = io(config.socketAddress, {
      query: 'key=bogus'
    })
    console.log('Attempting to connect to socket')
    let count = 1
    socket.on('connect', (socket) => {
      console.log('Connected!!', count)
      socket.emit('eventFromScript', `hellooo ${count}`)
      count += 1
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