import mongoose from 'mongoose'
import Queue from 'bull'
import Redis from 'ioredis'

import config from '../config'
import * as db from '../db'
import { Jobs } from '../worker/jobs'
import {
  AssistmentsData,
  getAssistmentsDataWithPipeline,
} from '../models/AssistmentsData'
import { Session } from '../models/Session'

async function queueJobs(ads: AssistmentsData[], queue: Queue.Queue): Promise<void> {
  console.log(`Found ${ads.length} ADs to process`)
  let total = 0
  for (const ad of ads) {
    if (ad.session) {
      const sessionId = (ad.session as Session)._id
      try {
        await queue.add(Jobs.SendAssistmentsData, { sessionId })
        total += 1
        console.log(`Queued job to send session ${sessionId}`)
      } catch (err) {
        console.log(`Failed to queue job for session ${sessionId}`)
      }
    }
  }
  console.log(`Successfully processed ${total} ADs`)
}

const backfillTimePeriodADs = async (start: Date, end: Date): Promise<AssistmentsData[]> => {
  const ads = await getAssistmentsDataWithPipeline([
    {
      $match: {
        sent: false,
        sentAt: { $exists: false }
      }
    },
    {
      $lookup: {
        from: 'sessions',
        localField: 'session',
        foreignField: '_id',
        as: 'session'
      }
    },
    {
      $unwind: {
        path: '$session' 
      }
    },
    {
      $match: {
        'session': { $exists: true },
        'session.createdAt': { $gt: start, $lte: end },
        'session.endedAt': { $exists: true }
      }
    }
  ]) as AssistmentsData[]
  
  return ads
}

async function backfillHistoryADs(end: Date): Promise<AssistmentsData[]> {
  const ads = await getAssistmentsDataWithPipeline([
    {
      $match: {
        sent: false,
        sentAt: { $exists: false }
      }
    },
    {
      $lookup: {
        from: 'sessions',
        localField: 'session',
        foreignField: '_id',
        as: 'session'
      }
    },
    {
      $unwind: {
        path: '$session' 
      }
    },
    {
      $match: {
        'session': { $exists: true },
        'session.createdAt': { $lte: end },
        'session.endedAt': { $exists: true }
      }
    }
  ]) as AssistmentsData[]

  return ads
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  let exitCode = 0
  try {
    await db.connect()
    const queue = new Queue(config.workerQueueName, {
      createClient: () => new Redis(config.redisConnectionString),
      settings: {
        stalledInterval: 1000 * 60 * 30,
        lockDuration: 1000 * 60 * 30
      }
    })

    let ads: AssistmentsData[]
    if (args.length === 2) {
      const start = new Date(args[0])
      const end = new Date(args[1])
      ads = await backfillTimePeriodADs(start, end)
    } else if (args.length === 1) {
      const end = new Date(args[0])
      ads = await backfillHistoryADs(end)
    } else {
      throw new Error(`Incorrect arguments: ${args}`)
    }

    await queueJobs(ads, queue)
  } catch (err) {
    console.log(`Uncaught error: ${err.message}`)
    exitCode = 1
  } finally {
    await mongoose.disconnect()
    process.exit(exitCode)
  }
}

// npx ts-node dbutils/add-session-flags.ts $START_DATE $END_DATE
main()