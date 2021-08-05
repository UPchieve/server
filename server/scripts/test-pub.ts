import { testPubClient, testChannel } from '../services/RedisService'

function main() {
  const data = {
    isNewSession: true,
    message: 'Started a new session'
  }
  testPubClient.publish(testChannel + 'session-123457', 'Started a new session')
  testPubClient.publish(testChannel + 'session-123458', JSON.stringify(data))
}

main()
