import { wrapInsert, NameToId, getDbUlid } from '../utils'
import * as pgQueries from './pg.queries'

export async function students(spoIds: NameToId) {
  const student1 = getDbUlid()
  const student2 = getDbUlid()
  const student3 = getDbUlid()

  const users = [
    {
      id: student1,
      email: 'student1@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Student',
      lastName: 'UPchieve',
      referralCode: 'A',
      verified: true,
    },
    {
      id: student2,
      email: 'student2@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Student',
      lastName: 'UPchieve',
      referralCode: 'F',
      verified: true,
    },
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

  const profiles = [
    {
      userId: student1,
      studentPartnerOrgId: undefined,
    },
    {
      userId: student2,
      studentPartnerOrgId: undefined,
    },
    {
      userId: student3,
      studentPartnerOrgId: spoIds['Placeholder 3'] as string,
    },
  ]

  for (const user of users) {
    await wrapInsert('users', pgQueries.insertStudentUser.run, { ...user })
  }

  for (const profile of profiles) {
    await wrapInsert('student_profiles', pgQueries.insertStudentProfile.run, {
      ...profile,
    })
  }
}
