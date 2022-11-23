import Queue from 'bull'
import { find, map } from 'lodash'
import Redis from 'ioredis'
import config from '../config'
import { log } from '../worker/logger'
import { Jobs } from '../worker/jobs'

interface JobTemplate {
  name: Jobs
  data?: any
  options?: Queue.JobOptions
}

const jobTemplates: JobTemplate[] = [
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
    name: Jobs.EmailWeeklyHourSummary,
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
]

const main = async (): Promise<void> => {
  try {
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
        if (find(jobTemplates, template => template.name === job.name)) {
          log(`Stopping jobs: \n${JSON.stringify(job, null, ' ')}`)
          await queue.removeRepeatableByKey(job.key)
        }
      })
    )

    log(`Starting jobs: \n${JSON.stringify(jobTemplates, null, ' ')}`)
    await Promise.all(
      map(jobTemplates, job =>
        queue.add(job.name, job.data, {
          ...job.options,
          removeOnComplete: true,
          removeOnFail: true,
        })
      )
    )

    process.exit(0)
  } catch (error) {
    console.log(error)
    process.exit(1)
  }
}

main()
