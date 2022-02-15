import { wrapInsert, NameToId } from '../utils'
import * as pgQueries from './pg.queries'

export async function weekdays(): Promise<NameToId> {
  const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]

  const temp: NameToId = {}
  for (const day of days) {
    temp[day] = await wrapInsert('us_states', pgQueries.insertWeekday.run, {
      day: day,
    })
  }
  return temp
}
