import Redis from 'ioredis'
import config from '../config'

export const redisClient = new Redis(config.redisConnectionString)

export const socketIoPubClient = new Redis(config.redisConnectionString)

export const socketIoSubClient = new Redis(config.redisConnectionString)

export const testPubClient = new Redis(config.redisConnectionString)

export const testSubClient = new Redis(config.redisConnectionString)

export const testChannel = 'test-channel/'
testSubClient.psubscribe(testChannel + '*')

// Buffers instead of strings
testSubClient.on('pmessageBuffer', (pattern, channelBuffer, messageBuffer) => {
  const namespace = channelBuffer.toString().slice(testChannel.length)
  console.log(
    `pmessageBuffer - Message: "${messageBuffer.toString()}" from channel: "${channelBuffer.toString()}" using pattern: "${pattern}" in namespace: "${namespace}"`
  )
})

testSubClient.on('pmessage', (pattern, channel, message) => {
  const namespace = channel.slice(testChannel.length)
  console.log(
    `pmessage - Message: "${message}" from channel: "${channel}" using pattern: "${pattern}" in namespace: "${namespace}"`
  )
})
