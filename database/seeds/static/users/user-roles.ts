import { wrapInsert, NameToId } from '../../utils'
import * as pgQueries from './pg.queries'

export async function userRoles(): Promise<NameToId> {
  const roles = [{ name: 'student' }, { name: 'volunteer' }, { name: 'admin' }]
  const temp: NameToId = {}
  for (const role of roles) {
    temp[role.name] = await wrapInsert(
      'user_roles',
      pgQueries.insertUserRole.run,
      { ...role }
    )
  }
  return temp
}
