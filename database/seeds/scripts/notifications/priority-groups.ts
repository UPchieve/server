import { wrapInsert, NameToId } from '../utils'
import * as pgQueries from './pg.queries'

export async function priorityGroups(): Promise<NameToId> {
  const groups = [
    {
      name:
        'Partner volunteers - not notified in the last 3 days AND they don’t have "high level subjects"',
      priority: 1,
    },
    {
      name:
        'Regular volunteers - not notified in the last 3 days AND they don’t have "high level subjects"',
      priority: 2,
    },
    {
      name:
        'Partner volunteers - not notified in the last 24 hours AND they don’t have "high level subjects"',
      priority: 3,
    },
    {
      name:
        'Regular volunteers - not notified in the last 24 hours AND they don’t have "high level subjects"',
      priority: 4,
    },
    {
      name: 'All volunteers - not notified in the last 24 hours',
      priority: 5,
    },
    {
      name: 'All volunteers - not notified in the last 60 mins',
      priority: 6,
    },
    {
      name: 'All volunteers - not notified in the last 15 mins',
      priority: 7,
    },
  ]
  const temp: NameToId = {}
  for (const group of groups) {
    temp[group.name] = await wrapInsert(
      'notification_priority_groups',
      pgQueries.insertPriorityGroup.run,
      { ...group }
    )
  }
  return temp
}
