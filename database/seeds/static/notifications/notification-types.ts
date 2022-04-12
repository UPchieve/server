import { wrapInsert, NameToId } from '../../utils'
import * as pgQueries from './pg.queries'

export async function notificationTypes(): Promise<NameToId> {
  const types = [{ type: 'initial' }, { type: 'followup' }]
  const temp: NameToId = {}
  for (const type of types) {
    temp[type.type] = await wrapInsert(
      'notification_types',
      pgQueries.insertNotificationType.run,
      { ...type }
    )
  }
  return temp
}
