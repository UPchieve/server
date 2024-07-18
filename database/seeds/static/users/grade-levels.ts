import { wrapInsert, NameToId } from '../../utils'
import * as pgQueries from './pg.queries'

export async function gradeLevels(): Promise<NameToId> {
  const grades = [
    { name: '8th' },
    { name: '9th' },
    { name: '10th' },
    { name: '11th' },
    { name: '12th' },
    { name: 'College' },
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
