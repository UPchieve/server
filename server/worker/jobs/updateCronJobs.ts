import Queue from 'bull'
import { find, map } from 'lodash'
import Redis from 'ioredis'
import config from '../../config'
import { log } from '../logger'
import { Jobs } from './jobs'

interface JobTemplate {
  name: Jobs
  data?: any
  options?: Queue.JobOptions
}

export const CRON_JOBS: JobTemplate[] = [
  {
    name: Jobs.UpdateElapsedAvailability,
    options: { repeat: { cron: '0 4 * * *', tz: 'America/New_York' } }, // each day at 4am
  },
  {
    name: Jobs.EndStaleSessions,
    options: { repeat: { cron: '0 */2 * * *' } }, // every 2 hours at minute 0
  },
  {
    name: Jobs.EmailReferences,
    options: { repeat: { cron: '*/15 * * * *' } }, // every 15 minutes
  },
  {
    name: Jobs.EmailReadyToCoach,
    options: { repeat: { cron: '30 * * * *' } }, // every hour at minute 30
  },
  {
    name: Jobs.EmailReferenceFollowup,
    options: { repeat: { cron: '0 10 * * *', tz: 'America/New_York' } }, // each day at 10am
  },
  {
    name: Jobs.EmailWaitingOnReferences,
    options: { repeat: { cron: '0 11 * * *', tz: 'America/New_York' } }, // each day at 11am
  },
  {
    name: Jobs.EmailNiceToMeetYou,
    options: { repeat: { cron: '0 10 * * *', tz: 'America/New_York' } }, // each day at 10am
  },
  {
    name: Jobs.UpdateTotalVolunteerHours,
    options: { repeat: { cron: '0 6 * * MON', tz: 'America/New_York' } }, // every Monday at 6am EST
  },
  {
    name: Jobs.SpawnEmailWeeklyHourSummaryJobs,
    options: { repeat: { cron: '0 6 * * MON', tz: 'America/New_York' } }, // every Monday at 6am EST
  },
  {
    name: Jobs.EmailVolunteerInactive,
    options: { repeat: { cron: '0 9 * * *', tz: 'America/New_York' } }, // each day at 9am
  },
  {
    name: Jobs.EmailVolunteerInactiveBlackoutOver,
    options: { repeat: { cron: '0 9 2 9 *', tz: 'America/New_York' } }, // On Septempber 2nd at 9am
  },
  {
    name: Jobs.GenerateAndStoreWaitTimeHeatMap,
    options: { repeat: { cron: '0 8 * * MON', tz: 'America/New_York' } }, // every Monday at 8am EST
  },
  {
    name: Jobs.UpdateGradeLevel,
    options: { repeat: { cron: '0 8 1 8 *', tz: 'America/New_York' } }, // On August 1st at 8am ET
  },
  {
    name: Jobs.TurnOffStandaloneAiTutor,
    options: { repeat: { cron: '0 23 * * *', tz: 'America/New_York' } }, // Daily at 11pm ET
  },
  {
    name: Jobs.TurnOnStandaloneAiTutor,
    options: { repeat: { cron: '0 13 * * *', tz: 'America/New_York' } }, // Daily at 1pm ET
  },
]
export default async function updateCronJobs() {
  const queue = new Queue(config.workerQueueName, {
    createClient: () => new Redis(config.redisConnectionString),
    settings: {
      // to prevent stalling long jobs
      stalledInterval: 1000 * 60 * 30,
      lockDuration: 1000 * 60 * 30,
    },
  })

  const repeatableJobs = await queue.getRepeatableJobs()

  await Promise.all(
    map(repeatableJobs, async job => {
      if (find(CRON_JOBS, template => template.name === job.name)) {
        log(`Stopping jobs: \n${JSON.stringify(job, null, ' ')}`)
        await queue.removeRepeatableByKey(job.key)
      }
    })
  )

  log(`Starting jobs: \n${JSON.stringify(CRON_JOBS, null, ' ')}`)
  await Promise.all(
    map(CRON_JOBS, job =>
      queue.add(job.name, job.data, {
        ...job.options,
        removeOnComplete: true,
        removeOnFail: true,
      })
    )
  )
}
