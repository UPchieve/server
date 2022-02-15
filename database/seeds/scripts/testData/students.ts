import {
  wrapInsert,
  NameToId,
  getDbUlid,
  ASSISTMENTS_STUDENT_ID,
} from '../utils'
import * as pgQueries from './pg.queries'

export async function students(spoIds: NameToId) {
  const student1 = getDbUlid()
  const student2 = getDbUlid()
  const student3 = getDbUlid()
  const student4 = getDbUlid()
  const student5 = getDbUlid()
  const student6 = getDbUlid()

  const users = [
    {
      id: student1,
      email: 'student1@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Student 1',
      lastName: 'open, verified',
      referralCode: 'A',
      verified: true,
      banned: false,
      referredBy: null,
    },
    {
      id: student2,
      email: 'student2@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Student 2',
      lastName: 'open, verified, banned',
      referralCode: 'F',
      verified: true,
      banned: true,
      referredBy: null,
    },
    {
      id: student3,
      email: 'student3@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Student 3',
      lastName: 'open, unverified',
      referralCode: 'G',
      verified: false,
      banned: false,
      referredBy: null,
    },
    {
      id: student4,
      email: 'student4@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Student 4',
      lastName: 'partner, verified',
      referralCode: 'H',
      verified: true,
      banned: false,
      referredBy: null,
    },
    {
      id: student5,
      email: 'student5@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Student 5',
      lastName: 'assistments, verified',
      referralCode: 'H',
      verified: true,
      banned: false,
      referredBy: null,
    },
    {
      id: student6,
      email: 'student6@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Student 6',
      lastName: 'open, verified, referred',
      referralCode: 'I',
      verified: true,
      referredBy: student1,
      banned: false,
    },
  ]

  const profiles = [
    {
      userId: student1,
      studentPartnerOrgId: null,
      studentPartnerOrgUserId: null,
    },
    {
      userId: student2,
      studentPartnerOrgId: null,
      studentPartnerOrgUserId: null,
    },
    {
      userId: student3,
      studentPartnerOrgId: null,
      studentPartnerOrgUserId: null,
    },
    {
      userId: student4,
      studentPartnerOrgId: spoIds['Placeholder 3'] as string,
      studentPartnerOrgUserId: null,
    },
    {
      userId: student5,
      studentPartnerOrgId: spoIds['assistments'] as string,
      studentPartnerOrgUserId: ASSISTMENTS_STUDENT_ID,
    },
    {
      userId: student6,
      studentPartnerOrgId: null,
      studentPartnerOrgUserId: null,
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
