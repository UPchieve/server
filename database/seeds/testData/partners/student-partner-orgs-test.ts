import { wrapInsert, NameToId, getDbUlid } from '../../utils'
import * as pgQueries from './pg.queries'

export async function studentPartnerOrgsTest(): Promise<NameToId> {
  const orgs = [
    {
      id: getDbUlid(),
      key: 'college-mentors',
      name: 'College Mentors',
      highSchoolSignup: true,
      collegeSignup: false,
      schoolSignupRequired: true,
      signupCode: 'MENTORS',
    },
    {
      id: getDbUlid(),
      key: 'community-org',
      name: 'Community Org',
      highSchoolSignup: true,
      collegeSignup: false,
      schoolSignupRequired: false,
      signupCode: 'COMMUNITY',
    },
    {
      id: getDbUlid(),
      key: 'school-helpers',
      name: 'School Helpers',
      highSchoolSignup: false,
      collegeSignup: false,
      schoolSignupRequired: false,
      signupCode: 'SCHOOLHELPERS',
    },
    {
      id: getDbUlid(),
      key: 'college-learners',
      name: 'College Learners',
      highSchoolSignup: false,
      collegeSignup: true,
      schoolSignupRequired: true,
      signupCode: 'COLLEGELEARNERS',
    },
    {
      id: getDbUlid(),
      key: 'all-the-students',
      name: 'All The Students',
      highSchoolSignup: true,
      collegeSignup: true,
      schoolSignupRequired: true,
      signupCode: 'ALLTHESTUDENTS',
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
