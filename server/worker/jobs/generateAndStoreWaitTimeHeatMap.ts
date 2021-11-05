import moment from 'moment'
import * as SessionService from '../../services/SessionService'
import { log } from '../logger'
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

  log(
    `Executing ${Jobs.GenerateAndStoreWaitTimeHeatMap} for ${lastMonday} to ${lastSunday}.`
  )
  try {
    await SessionService.generateAndStoreWaitTimeHeatMap(lastMonday, lastSunday)
  } catch (error) {
    throw error
  }
}
