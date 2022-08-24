import { wrapInsert, NameToId } from '../../utils'
import * as pgQueries from './pg.queries'

export async function banReasons(): Promise<NameToId> {
  const reasons = [
    {
      name: 'non us signup',
    },
    {
      name: 'session reported',
    },
    {
      name: 'used banned ip',
    },
    { name: 'admin' },
    {
      name: 'banned service provider',
    },
  ]
  const temp: NameToId = {}
  for (const reason of reasons) {
    temp[reason.name] = await wrapInsert(
      'ban_reasons',
      pgQueries.insertBanReason.run,
      { ...reason }
    )
  }
  return temp
}
