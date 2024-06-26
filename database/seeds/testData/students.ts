import { wrapInsert, NameToId, getDbUlid } from '../utils'
import * as pgQueries from './pg.queries'

export async function students(spoIds: NameToId, schoolIds: NameToId) {
  const student1 = getDbUlid()
  const student2 = getDbUlid()
  const student3 = getDbUlid()
  const student4 = getDbUlid()

  const users = [
    // Student from valid high school
    {
      id: student1,
      email: 'student1@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Student',
      lastName: 'UPchieve',
      referralCode: 'A',
      verified: true,
    },
    // Student from partner org with a school
    {
      id: student2,
      email: 'student2@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Student',
      lastName: 'UPchieve',
      referralCode: 'F',
      verified: true,
    },
    // Student from partner org with no school
    {
      id: student3,
      email: 'student3@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Student',
      lastName: 'UPchieve',
      referralCode: 'G',
      verified: true,
      test_user: true,
    },
  ]

  const userMap: NameToId = {}
  for (const user of users) {
    userMap[user.id] = await wrapInsert(
      'users',
      pgQueries.insertStudentUser.run,
      { ...user }
    )
    await wrapInsert(
      'user_session_metrics',
      pgQueries.insertUserSessionMetrics.run,
      { id: user.id }
    )
    await wrapInsert(
      'user_product_flags',
      pgQueries.insertUserProductFlags.run,
      { id: user.id }
    )
  }

  const profiles = [
    {
      userId: userMap[student1] as string,
      studentPartnerOrgId: undefined,
      schoolId: schoolIds['Approved School'] as string,
    },
    {
      userId: userMap[student2] as string,
      studentPartnerOrgId: spoIds['College Mentors'] as string,
      schoolId: schoolIds['Approved Partner School'] as string,
    },
    {
      userId: userMap[student3] as string,
      studentPartnerOrgId: spoIds['School Helpers'] as string,
      schoolId: undefined,
    },
  ]

  for (const profile of profiles) {
    await wrapInsert('student_profiles', pgQueries.insertStudentProfile.run, {
      ...profile,
    })
  }
}
