import { wrapInsert, NameToId, getDbUlid } from '../utils'
import * as pgQueries from './pg.queries'

export async function schools(): Promise<NameToId> {
  const schools = [
    {
      id: getDbUlid(),
      name: 'test data',
      approved: false,
      partner: false,
    },
    {
      id: getDbUlid(),
      name: 'Legacy Signup High School',
      approved: true,
      partner: true,
    },
  ]
  const temp: NameToId = {}
  for (const school of schools) {
    temp[school.name] = await wrapInsert(
      'schools',
      pgQueries.insertSchool.run,
      { ...school }
    )
  }
  return temp
}
