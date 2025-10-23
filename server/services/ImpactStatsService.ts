import * as SessionService from './SessionService'
import * as SessionRepo from '../models/Session'
import config from '../config'
import { Ulid } from '../models/pgUtils'
import moment from 'moment'
import { TransactionClient } from '../db'

const MS_IN_AN_HOUR = 3_600_000

export async function hoursTutoredThisWeek(userId: Ulid) {
  const lastMonday = moment().utc().startOf('isoWeek').toDate()
  const now = moment().utc().toDate()
  const msTutoredThisWeek = await SessionService.getTimeTutoredForDateRange(
    userId,
    lastMonday,
    now
  )

  return Number((msTutoredThisWeek / MS_IN_AN_HOUR).toFixed(2))
}

export async function uniqueStudentsHelpedCount(userId: Ulid) {
  return await SessionRepo.getUniqueStudentsHelpedCount(
    userId,
    config.minSessionLength
  )
}
