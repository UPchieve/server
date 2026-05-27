import newrelic from 'newrelic'
import { Server as SocketIoServer } from 'socket.io'
import { createAdapter } from '@socket.io/redis-streams-adapter'
import * as db from '../db'
import logger from '../logger'
import { addJobProcessors } from './jobs'
import { registerListeners } from '../services/listeners'
import QueueService from '../services/QueueService'
import { redisClient } from '../services/RedisService'
import SocketService from '../services/SocketService'

// Initialize a headless Socket.IO server in the worker process so jobs (e.g.
// PromptStudentToBreakout, EndUnmatchedSession's exclusive-request cleanup) can
// emit events to clients connected to the HTTP server. 
function initWorkerSocketService(): void {
  const io = new SocketIoServer()
  io.adapter(createAdapter(redisClient))
  SocketService.getInstance(io)
}

const main = async (): Promise<void> => {
  try {
    await db.connect()
    logger.info('Starting queue')
    const queue = QueueService.queue

    initWorkerSocketService()
    addJobProcessors(queue)
    registerListeners()
  } catch (error) {
    newrelic.noticeError(error as Error)
    // handle redis connection errors; for whatever reason Redis.ReplyError type is not in the declarations file
    if ((error as any).code === 'ECONNREFUSED') {
      logger.error(
        error,
        `Could not connect to redis server; Check your redisConnectionString env var`
      )
    } else {
      logger.error(error, `Error from worker process`)
    }
  }
}

main().catch((error) => {
  logger.error(`error in worker main: ${error}`)
  newrelic.noticeError(error)
})
