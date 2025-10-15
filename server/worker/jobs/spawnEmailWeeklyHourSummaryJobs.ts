import moment from 'moment'
import 'moment-timezone'
import { Jobs } from '.'
import { getVolunteersForWeeklyHourSummary } from '../../models/Volunteer/queries'
import logger from '../../logger'
import QueueService from '../../services/QueueService'

// Runs weekly at 6am EST on Monday
export default async (): Promise<void> => {
  //  Monday-Sunday
  const lastMonday = moment()
    .utc()
    .subtract(1, 'weeks')
    .startOf('isoWeek')
    .toISOString()
  const lastSunday = moment()
    .utc()
    .subtract(1, 'weeks')
    .endOf('isoWeek')
    .toISOString()

  const volunteers = await getVolunteersForWeeklyHourSummary(lastMonday)
  const errors: { userId: string; error: unknown }[] = []
  for (const volunteer of volunteers) {
    try {
      await QueueService.add(
        Jobs.EmailWeeklyHourSummary,
        {
          startDate: lastMonday,
          endDate: lastSunday,
          volunteer,
        },
        {
          /*
            By default, all jobs have the highest priority of 1.
            Since this job can spawn a few thousand jobs that aren't time sensitive,
            we're setting priority to 3. That way, if we have 10,000 of these jobs
            in the queue and a `NotifyTutors` job comes in, it can skip to the front
            of the queue.
          */
          priority: 3,
        }
      )
    } catch (error) {
      errors.push({ userId: volunteer.id, error })
    }
  }

  if (errors.length) {
    logger.error(
      '%s: Failed to queue %d! jobs: %o',
      Jobs.SpawnEmailWeeklyHourSummaryJobs,
      errors.length,
      {
        lastMonday,
        lastSunday,
        errors,
      }
    )
  }
}
