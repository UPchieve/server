import { wrapInsert, NameToId, getDbUlid } from '../utils'
import * as pgQueries from './pg.queries'

export async function studentPartnerOrgsTest(): Promise<NameToId> {
  const orgs = [
    {
      id: getDbUlid(),
      key: 'placeholder1',
      name: 'Placeholder 1',
      highSchoolSignup: true,
      schoolSignupRequired: true,
    },
    {
      id: getDbUlid(),
      key: 'placeholder2',
      name: 'Placeholder 2',
      highSchoolSignup: true,
      schoolSignupRequired: false,
    },
    {
      id: getDbUlid(),
      key: 'placeholder3',
      name: 'Placeholder 3',
      highSchoolSignup: false,
      schoolSignupRequired: false,
    },
  ]
  const temp: NameToId = {}
  for (const org of orgs) {
    temp[org.name] = await wrapInsert(
      'student_partner_orgs',
      pgQueries.insertStudentPartnerOrg.run,
      { ...org }
    )
  }
  return temp
}
