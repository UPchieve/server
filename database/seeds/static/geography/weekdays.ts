import { wrapInsert, NameToId } from '../../utils'
import * as pgQueries from './pg.queries'

export async function weekdays(): Promise<NameToId> {
  const temp: NameToId = {}
  const weekdays = [
    { id: 1, day: 'Sunday' },
    { id: 2, day: 'Monday' },
    { id: 3, day: 'Tuesday' },
    { id: 4, day: 'Wednesday' },
    { id: 5, day: 'Thursday' },
    { id: 6, day: 'Friday' },
    { id: 7, day: 'Saturday' },
  ]
  for (const weekday of weekdays) {
    temp[weekday.day] = await wrapInsert(
      'us_states',
      pgQueries.insertWeekday.run,
      { ...weekday }
    )
  }
  return temp
}
