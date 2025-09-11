import { JobOptions as BullJobOptions } from 'bull'
import logger from '../../logger'
import { Jobs } from '.'
import queue from '../../services/QueueService'

interface JobTemplate {
  name: Jobs
  data?: any
  options?: BullJobOptions
}

export default async function addScheduledJobs() {
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
  ]

  const repeatableJobs = await queue.getRepeatableJobs()

  repeatableJobs.map(async (job) => {
    if (jobTemplates.find((template) => template.name === job.name)) {
      logger.info(`Removing scheduled job: ${job.name}...`)
      await queue.removeRepeatableByKey(job.key)
    }
  })

  jobTemplates.forEach(async (job) => {
    logger.info(`Adding scheduled job ${job.name}...`)
    await queue.add(job.name, job.data, {
      ...job.options,
      removeOnComplete: true,
      removeOnFail: true,
    })
  })
}
