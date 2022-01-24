import { wrapInsert, NameToId } from '../utils'
import * as pgQueries from './pg.queries'

export async function topics(): Promise<NameToId> {
  const topics = [
    {
      name: 'math',
      displayName: 'Math',
      dashboardOrder: 1,
    },
    {
      name: 'science',
      displayName: 'Science',
      dashboardOrder: 4,
    },
    {
      name: 'college',
      displayName: 'College Counseling',
      dashboardOrder: 3,
    },
    {
      name: 'sat',
      displayName: 'Standardized Testing',
      dashboardOrder: 2,
    },
    {
      name: 'readingWriting',
      displayName: 'Reading and Writing',
      dashboardOrder: 5,
    },
  ]
  const temp: NameToId = {}
  for (const topic of topics) {
    temp[topic.name] = await wrapInsert('topics', pgQueries.insertTopic.run, {
      ...topic,
    })
  }
  return temp
}
