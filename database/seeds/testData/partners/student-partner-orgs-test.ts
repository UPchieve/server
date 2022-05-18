import { wrapInsert, NameToId, getDbUlid } from '../../utils'
import * as pgQueries from './pg.queries'

export async function studentPartnerOrgsTest(): Promise<NameToId> {
  const orgs = [
    {
      id: getDbUlid(),
      key: 'college-mentors',
      name: 'College Mentors',
      highSchoolSignup: true,
      schoolSignupRequired: true,
      signupCode: 'MENTORS',
    },
    {
      id: getDbUlid(),
      key: 'community-org',
      name: 'Community Org',
      highSchoolSignup: true,
      schoolSignupRequired: false,
      signupCode: 'COMMUNITY',
    },
    {
      id: getDbUlid(),
      key: 'school-helpers',
      name: 'School Helpers',
      highSchoolSignup: false,
      schoolSignupRequired: false,
      signupCode: 'SCHOOLHELPERS',
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
