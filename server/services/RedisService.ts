import Redis, { Redis as RedisClientType } from 'ioredis'
import config from '../config'
import logger from '../logger'
import { Ulid } from '../models/pgUtils'

type EventData = {
  sessionId?: Ulid
  id?: Ulid
}

type ParsedArg =
  | {
      packet: {
        data: [string, EventData]
      }
    }
  | string

const clientToServerEventKeys = [
  'join',
  'activity-prompt-sent',
  'auto-end-session',
  'sessions/recap:join',
  'list',
  'typing',
  'notTyping',
  'message',
  'requestQuillState',
  'requestQuillStateV2',
  'transmitQuillDeltaV2',
  'transmitQuillDelta',
  'transmitQuillSelection',
  'resetWhiteboard',
  'sessions:leave',
  'sessions/recap:leave',
]

const serverToClientEventKeys = [
  'redirect',
  'message',
  'messageSend',
  'sessions/partner:in-session',
  'sessions/recap:joined',
  'sessions/recap:join-failed',
  'sessions',
  'is-typing',
  'not-typing',
  'messageError',
  'lastDeltaStored',
  'quillState',
  'retryLoadingDoc',
  'quillStateV2',
  'partnerQuillDeltaV2',
  'partnerQuillDelta',
  'quillPartnerSelection',
  'resetWhiteboard',
  'session-change',
]

const eventsToCapture = [...clientToServerEventKeys, ...serverToClientEventKeys]

function extractSessionId(
  eventName: string,
  data: EventData
): string | undefined {
  switch (eventName) {
    case 'join':
    case 'activity-prompt-sent':
    case 'auto-end-session':
    case 'sessions/recap:join':
    case 'sessions/recap:leave':
    case 'typing':
    case 'notTyping':
    case 'message':
    case 'requestQuillState':
    case 'requestQuillStateV2':
    case 'transmitQuillDeltaV2':
    case 'transmitQuillDelta':
    case 'transmitQuillSelection':
    case 'resetWhiteboard':
    case 'sessions:leave':
    case 'messageSend':
    case 'messageError':
    case 'is-typing':
    case 'not-typing':
      return data.sessionId

    case 'session-change':
      return data.id

    default:
      return undefined
  }
}

function getEventNameAndData(
  args: any[]
): { eventName: string; data: { sessionId?: Ulid } } | undefined {
  try {
    for (const arg of args) {
      if (typeof arg === 'string') {
        try {
          const parsedArg = JSON.parse(arg) as ParsedArg

          if (parsedArg && typeof parsedArg === 'object' && parsedArg.packet) {
            const [eventName, packetData] = parsedArg.packet.data
            if (!eventsToCapture.includes(eventName)) continue
            const sessionId = extractSessionId(eventName, packetData)
            return {
              eventName,
              data: {
                sessionId,
              },
            }
          }
        } catch (error) {
          logger.warn(`Failed to parse argument as JSON: ${arg}`)
          continue
        }
      }
    }
  } catch (error) {
    logger.error(
      `Redis error processing event data: ${(error as Error).message}`
    )
  }
}

const baseClient: RedisClientType = new Redis(config.redisConnectionString)

export const redisClient = new Proxy(baseClient, {
  get(target, command: keyof RedisClientType) {
    const originalMethod = target[command]

    if (typeof originalMethod === 'function' && command === 'xadd') {
      return async (args: any[]) => {
        const logData = getEventNameAndData(args)
        if (logData?.eventName && logData.data.sessionId)
          logger.info(
            `Redis event ${logData.eventName} for session ${logData.data.sessionId}`
          )

        try {
          return await (originalMethod as Function).apply(target, args)
        } catch (error) {
          logger.error(
            `Redis command ${String(command)} failed. Error: ${
              (error as Error).message
            }`
          )
          throw error
        }
      }
    }
    return originalMethod
  },
})

redisClient.on('connect', () => {
  logger.info('Redis Streams Adapter client connected to Redis')
})

redisClient.on('ready', () => {
  logger.info('Redis Streams Adapter client ready')
})

redisClient.on('end', () => {
  logger.warn('Redis Streams Adapter client connection closed')
})

redisClient.on('reconnecting', time => {
  logger.warn(`Redis Streams Adapter client reconnecting in ${time}ms`)
})

redisClient.on('error', error => {
  logger.error('Redis Streams Adapter client error:', error)
})
