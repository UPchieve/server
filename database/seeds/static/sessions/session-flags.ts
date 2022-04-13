import { wrapInsert, NameToId } from '../../utils'
import * as pgQueries from './pg.queries'

export async function sessionFlags(): Promise<NameToId> {
  const flags = [
    {
      name: 'Absent student',
    },
    {
      name: 'Absent volunteer',
    },
    {
      name: 'Low session rating from coach',
    },
    {
      name: 'Low session rating from student',
    },
    {
      name: 'Low coach rating from student',
    },
    { name: 'Reported' },
    {
      name: 'Only looking for answers',
    },
    {
      name: 'Rude or inappropriate',
    },
    {
      name: 'Comment from student',
    },
    {
      name: 'Comment from volunteer',
    },
    {
      name: 'Has been unmatched',
    },
    {
      name: 'Has had technical issues',
    },
  ]
  const temp: NameToId = {}
  for (const flag of flags) {
    temp[flag.name] = await wrapInsert(
      'session_flags',
      pgQueries.insertSessionFlag.run,
      { ...flag }
    )
  }
  return temp
}
