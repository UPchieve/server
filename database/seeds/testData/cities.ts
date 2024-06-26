import { wrapInsert, NameToId } from '../utils'
import * as pgQueries from './pg.queries'

export async function cities(): Promise<NameToId> {
  const schools = [
    {
      name: 'Denver',
      usStateCode: 'CO',
    },
    {
      name: 'Brooklyn',
      usStateCode: 'NY',
    },
  ]
  const temp: NameToId = {}
  for (const school of schools) {
    temp[school.name] = await wrapInsert('schools', pgQueries.insertCity.run, {
      ...school,
    })
  }
  return temp
}
