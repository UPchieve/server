import moment from 'moment'
import * as SessionService from '../../services/SessionService'
import logger from '../../logger'
import { Jobs } from '.'

export default async (): Promise<void> => {
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

  try {
    await SessionService.generateAndStoreWaitTimeHeatMap(lastMonday, lastSunday)
    logger.info(
      `Successfuly executed ${Jobs.GenerateAndStoreWaitTimeHeatMap} for ${lastMonday} to ${lastSunday}.`
    )
  } catch (error) {
    throw error
  }
}
