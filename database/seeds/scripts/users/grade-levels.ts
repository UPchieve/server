import { wrapInsert, NameToId } from '../utils'
import * as pgQueries from './pg.queries'

export async function gradeLevels(): Promise<NameToId> {
  const grades = [
    { name: '8' },
    { name: '9' },
    { name: '10' },
    { name: '11' },
    { name: '12' },
    { name: 'college' },
  ]
  const temp: NameToId = {}
  for (const grade of grades) {
    temp[grade.name] = await wrapInsert(
      'grade_levels',
      pgQueries.insertGradeLevel.run,
      { ...grade }
    )
  }
  return temp
}
