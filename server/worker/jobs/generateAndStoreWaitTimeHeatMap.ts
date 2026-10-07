import { Job } from 'bull'
import moment from 'moment'
import * as SessionService from '../../services/SessionService'
import logger from '../../logger'

export default async (job: Job<undefined>): Promise<void> => {
  const lastMonday = moment()
    .utc()
    .subtract(1, 'weeks')
    .startOf('isoWeek')
    .toDate()
  const lastSunday = moment()
    .utc()
    .subtract(1, 'weeks')
    .endOf('isoWeek')
    .toDate()

  logger.info(`Executing ${job.name} for ${lastMonday} to ${lastSunday}.`)
  try {
    await SessionService.generateAndStoreWaitTimeHeatMap(lastMonday, lastSunday)
  } catch (error) {
    throw error
  }
}
