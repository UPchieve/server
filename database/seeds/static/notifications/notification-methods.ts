import { wrapInsert, NameToId } from '../../utils'
import * as pgQueries from './pg.queries'

export async function notificationMethods(): Promise<NameToId> {
  const methods = [
    { method: 'sms' },
    { method: 'push' },
    { method: 'voice' },
    { method: 'email' },
  ]
  const temp: NameToId = {}
  for (const method of methods) {
    temp[method.method] = await wrapInsert(
      'notification_methods',
      pgQueries.insertNotificationMethod.run,
      { ...method }
    )
  }
  return temp
}
