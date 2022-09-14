import { wrapInsert, NameToId } from '../../utils'
import * as pgQueries from './pg.queries'

export async function volunteerReferenceStatuses(): Promise<NameToId> {
  const statuses = [
    { name: 'sent' },
    { name: 'submitted' },
    { name: 'approved' },
    { name: 'rejected' },
    { name: 'removed' },
    { name: 'unsent' },
  ]
  const temp: NameToId = {}
  for (const status of statuses) {
    temp[status.name] = await wrapInsert(
      'volunteer_reference_statuses',
      pgQueries.insertVolunteerReferenceStatus.run,
      { ...status }
    )
  }
  return temp
}
