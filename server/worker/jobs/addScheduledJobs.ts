import { JobOptions as BullJobOptions } from 'bull'
import logger from '../../logger'
import type { JobData, JobName } from '.'
import * as QueueService from '../../services/QueueService'
import moment from 'moment'
import 'moment-timezone'

type JobTemplate = {
  [N in JobName]: {
    name: N
    options?: BullJobOptions
  } & (JobData<N> extends undefined
    ? { data?: JobData<N> }
    : { data: JobData<N> })
}[JobName]

export default async function addScheduledJobs() {
  const jobTemplates: JobTemplate[] = [
    {
      name: 'UpdateElapsedAvailability',
      options: { repeat: { cron: '0 4 * * *', tz: 'America/New_York' } }, // each day at 4am
    },
    {
      name: 'EndStaleSessions',
      options: { repeat: { cron: '0 */2 * * *' } }, // every 2 hours at minute 0
    },
    {
      name: 'EmailReferences',
      options: { repeat: { cron: '*/15 * * * *' } }, // every 15 minutes
    },
    {
      name: 'EmailReadyToCoach',
      options: { repeat: { cron: '30 * * * *' } }, // every hour at minute 30
    },
    {
      name: 'EmailReferenceFollowup',
      options: { repeat: { cron: '0 10 * * *', tz: 'America/New_York' } }, // each day at 10am
    },
    {
      name: 'EmailWaitingOnReferences',
      options: { repeat: { cron: '0 11 * * *', tz: 'America/New_York' } }, // each day at 11am
    },
    {
      name: 'EmailNiceToMeetYou',
      options: { repeat: { cron: '0 10 * * *', tz: 'America/New_York' } }, // each day at 10am
    },
    {
      name: 'UpdateTotalVolunteerHours',
      data: {},
      options: { repeat: { cron: '0 6 * * MON', tz: 'America/New_York' } }, // every Monday at 6am EST
    },
    {
      name: 'SpawnEmailWeeklyHourSummaryJobs',
      data: {},
      options: { repeat: { cron: '0 6 * * MON', tz: 'America/New_York' } }, // every Monday at 6am EST
    },
    {
      name: 'EmailVolunteerInactive',
      options: { repeat: { cron: '0 9 * * *', tz: 'America/New_York' } }, // each day at 9am
    },
    {
      name: 'EmailVolunteerInactiveBlackoutOver',
      options: { repeat: { cron: '0 9 2 9 *', tz: 'America/New_York' } }, // On Septempber 2nd at 9am
    },
    {
      name: 'GenerateAndStoreWaitTimeHeatMap',
      options: { repeat: { cron: '0 8 * * MON', tz: 'America/New_York' } }, // every Monday at 8am EST
    },
    {
      name: 'UpdateSendGridGradeLevels',
      options: { repeat: { cron: '0 8 1 8 *', tz: 'America/New_York' } }, // On August 1st at 8am ET
    },
    {
      name: 'RedisKeyMemStats',
      data: { keyPatterns: [] },
      options: { repeat: { cron: '0 5 * * *', tz: 'America/New_York' } }, // each day at 5am
    },
    {
      name: 'UpdateCachedVolunteersForTextNotifications',
      options: { repeat: { cron: '0 * * * *', tz: 'America/New_York' } }, // Every hour at minute 0
    },
    {
      name: 'ClearBullJobsByStatus',
      data: { statuses: ['completed', 'failed'], timeOffsetInMs: 0 },
      options: { repeat: { cron: '0 6 * * *', tz: 'America/New_York' } }, // each day at 6am
    },
    {
      name: 'SpawnUpdateNTHSChapterStatusForImpactPath',
      data: {
        periodStart: moment('2026-09-01').tz('America/New_York').toDate(),
        periodEnd: moment('2026-12-31').tz('America/New_York').toDate(),
      },
      options: { repeat: { cron: '0 * * * *', tz: 'America/New_York' } }, // Every hour at minute 0
    },

    {
      name: 'NTHSApplicationStatus',
      data: {
        periodStart: moment('2026-09-01').tz('America/New_York').toDate(),
        periodEnd: moment('2026-12-31').tz('America/New_York').toDate(),
      },
      options: { repeat: { cron: '*/15 * * * *' } }, // every 15 minutes
    },

    {
      name: 'NTHSCandidateEngagement',
      data: {
        cohortStartDate: moment('2026-09-01').tz('America/New_York').toDate(),
        cohortEndDate: moment('2026-12-31').tz('America/New_York').toDate(),
      },
      options: { repeat: { cron: '0 6 * * *', tz: 'America/New_York' } }, // each day at 6am
    },
    {
      name: 'SpawnNTHSChapterRenewal',
      options: { repeat: { cron: '0 * * * *' } },
    },
  ]

  const repeatableJobs = await QueueService.queue.getRepeatableJobs()

  for (const job of repeatableJobs) {
    if (jobTemplates.find((template) => template.name === job.name)) {
      logger.info(`Removing scheduled job: ${job.name}...`)
      await QueueService.queue.removeRepeatableByKey(job.key)
    }
  }

  for (const job of jobTemplates) {
    logger.info(`Adding scheduled job ${job.name}...`)
    await QueueService.add(
      job.name,
      {
        delay: 0,
        removeOnComplete: false,
        removeOnFail: false,
        ...job.options,
      },
      job.data
    )
  }
}
