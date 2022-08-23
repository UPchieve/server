import { wrapInsert, NameToId } from '../../utils'
import * as pgQueries from './pg.queries'

export async function photoIdStatuses(): Promise<NameToId> {
  const statuses = [
    { name: 'approved' },
    { name: 'submitted' },
    { name: 'rejected' },
    { name: 'empty' },
  ]
  const temp: NameToId = {}
  for (const status of statuses) {
    temp[status.name] = await wrapInsert(
      'photo_id_statuses',
      pgQueries.insertPhotoIdStatus.run,
      { ...status }
    )
  }
  return temp
}
