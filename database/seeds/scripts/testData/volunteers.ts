import { wrapInsert, NameToId, getDbUlid } from '../utils'
import * as pgQueries from './pg.queries'

export async function volunteers(
  vpoIds: NameToId,
  certIds: NameToId,
  quizIds: NameToId
) {
  const volunteer1 = getDbUlid()
  const volunteer2 = getDbUlid()
  const volunteer3 = getDbUlid()
  const volunteer4 = getDbUlid()

  const users = [
    {
      id: volunteer1,
      email: 'volunteer1@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Volunteer',
      lastName: 'UPchieve',
      referralCode: 'B',
      verified: true,
      // phone: '+12125551212',
      testUser: false,
      timeTutored: (7 * 60 * 60 * 1000).toString(),
    },
    {
      id: volunteer2,
      email: 'volunteer2@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Volunteer',
      lastName: 'UPchieve',
      referralCode: 'C',
      verified: true,
      // phone: '+12125551212',
      testUser: false,
      timeTutored: (0).toString(),
    },
    {
      id: volunteer3,
      email: 'volunteer3@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Volunteer',
      lastName: 'UPchieve',
      referralCode: 'D',
      verified: true,
      // phone: '+12125551212',
      testUser: true,
      timeTutored: (0).toString(),
    },
    {
      id: volunteer4,
      email: 'volunteer4@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Volunteer',
      lastName: 'UPchieve',
      referralCode: 'E',
      verified: true,
      // phone: '+12125551212',
      testUser: true,
      timeTutored: (0).toString(),
    },
  ]

  const profiles = [
    {
      userId: volunteer1,
      timezone: 'America/New_York',
      approved: true,
      onboarded: true,
      college: 'Volunteer College',
      volunteerPartnerOrgId: vpoIds['Placeholder 1'] as string,
    },
    {
      userId: volunteer2,
      timezone: 'America/New_York',
      approved: true,
      onboarded: false,
      college: 'Volunteer College',
      volunteerPartnerOrgId: undefined,
    },
    {
      userId: volunteer3,
      timezone: 'America/New_York',
      approved: false,
      onboarded: false,
      college: 'Volunteer College',
      volunteerPartnerOrgId: undefined,
    },
    {
      userId: volunteer4,
      timezone: 'America/New_York',
      approved: false,
      onboarded: false,
      college: 'Volunteer College',
      volunteerPartnerOrgId: undefined,
    },
  ]

  const certs = [
    {
      userId: volunteer1,
      certificationId: certIds['prealgebra'] as number,
    },
    {
      userId: volunteer1,
      certificationId: certIds['algebraOne'] as number,
    },
    {
      userId: volunteer1,
      certificationId: certIds['algebraTwo'] as number,
    },
    // {
    //   userId: volunteer1,
    //   certificationId: await getIdByNameFailsafe(
    //     'certifications',
    //     'application'
    //   ] as number,
    //   created_at: new Date(] as number,
    //   updated_at: new Date(] as number,
    // },
    {
      userId: volunteer1,
      certificationId: certIds['biology'] as number,
    },
    {
      userId: volunteer1,
      certificationId: certIds['calculusAB'] as number,
    },
    {
      userId: volunteer1,
      certificationId: certIds['chemistry'] as number,
    },
    {
      userId: volunteer1,
      certificationId: certIds['essays'] as number,
    },
    {
      userId: volunteer1,
      certificationId: certIds['geometry'] as number,
    },
    {
      userId: volunteer1,
      certificationId: certIds['physicsOne'] as number,
    },
    // {
    //   userId: volunteer1,
    //   certificationId: await getIdByNameFailsafe(
    //     'certifications',
    //     'planning'
    //   ] as number,
    //   created_at: new Date(] as number,
    //   updated_at: new Date(] as number,
    // },
    {
      userId: volunteer1,
      certificationId: certIds['precalculus'] as number,
    },
    {
      userId: volunteer1,
      certificationId: certIds['trigonometry'] as number,
    },
    {
      userId: volunteer1,
      certificationId: certIds['humanitiesEssays'] as number,
    },
    {
      userId: volunteer2,
      certificationId: certIds['prealgebra'] as number,
    },
    {
      userId: volunteer2,
      certificationId: certIds['algebraOne'] as number,
    },
    {
      userId: volunteer2,
      certificationId: certIds['algebraTwo'] as number,
    },
    // {
    //   userId: volunteer2,
    //   certificationId: await getIdByNameFailsafe(
    //     'certifications',
    //     'application'
    //   ] as number,
    //   created_at: new Date(] as number,
    //   updated_at: new Date(] as number,
    // },
    {
      userId: volunteer2,
      certificationId: certIds['biology'] as number,
    },
    {
      userId: volunteer2,
      certificationId: certIds['calculusAB'] as number,
    },
    {
      userId: volunteer2,
      certificationId: certIds['chemistry'] as number,
    },
    {
      userId: volunteer2,
      certificationId: certIds['essays'] as number,
    },
    {
      userId: volunteer2,
      certificationId: certIds['geometry'] as number,
    },
    {
      userId: volunteer2,
      certificationId: certIds['physicsOne'] as number,
    },
    // {
    //   userId: volunteer2,
    //   certificationId: await getIdByNameFailsafe(
    //     'certifications',
    //     'planning'
    //   ] as number,
    //   created_at: new Date(] as number,
    //   updated_at: new Date(] as number,
    // },
    {
      userId: volunteer2,
      certificationId: certIds['precalculus'] as number,
    },
    {
      userId: volunteer2,
      certificationId: certIds['trigonometry'] as number,
    },
  ]

  const quizzes = [
    {
      userId: volunteer1,
      quizId: quizIds['prealgebra'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer1,
      quizId: quizIds['algebraOne'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer1,
      quizId: quizIds['algebraTwo'] as number,
      attempts: 1,
      passed: true,
    },
    // {
    //   userId: volunteer1,
    //   quizId: quizIds['application'] as number,
    //   attempts: 1,
    //   passed: true,
    //   created_at: new Date(] as number,
    //   updated_at: new Date(] as number,
    // },
    {
      userId: volunteer1,
      quizId: quizIds['biology'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer1,
      quizId: quizIds['calculusAB'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer1,
      quizId: quizIds['chemistry'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer1,
      quizId: quizIds['essays'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer1,
      quizId: quizIds['geometry'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer1,
      quizId: quizIds['physicsOne'] as number,
      attempts: 1,
      passed: true,
    },
    // {
    //   userId: volunteer1,
    //   quizId: quizIds['planning'] as number,
    //   attempts: 1,
    //   passed: true,
    //   created_at: new Date(] as number,
    //   updated_at: new Date(] as number,
    // },
    {
      userId: volunteer1,
      quizId: quizIds['precalculus'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer1,
      quizId: quizIds['trigonometry'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer1,
      quizId: quizIds['humanitiesEssays'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer2,
      quizId: quizIds['prealgebra'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer2,
      quizId: quizIds['algebraOne'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer2,
      quizId: quizIds['algebraTwo'] as number,
      attempts: 1,
      passed: true,
    },
    // {
    //   userId: volunteer2,
    //   quizId: quizIds['application'] as number,
    //   attempts: 1,
    //   passed: true,
    //   created_at: new Date(] as number,
    //   updated_at: new Date(] as number,
    // },
    {
      userId: volunteer2,
      quizId: quizIds['biology'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer2,
      quizId: quizIds['calculusAB'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer2,
      quizId: quizIds['chemistry'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer2,
      quizId: quizIds['essays'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer2,
      quizId: quizIds['geometry'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer2,
      quizId: quizIds['physicsOne'] as number,
      attempts: 1,
      passed: true,
    },
    // {
    //   userId: volunteer2,
    //   quizId: quizIds['planning'] as number,
    //   attempts: 1,
    //   passed: true,
    //   created_at: new Date(] as number,
    //   updated_at: new Date(] as number,
    // },
    {
      userId: volunteer2,
      quizId: quizIds['precalculus'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer2,
      quizId: quizIds['trigonometry'] as number,
      attempts: 1,
      passed: true,
    },
  ]

  const admins = [
    {
      userId: volunteer1,
    },
    {
      userId: volunteer2,
    },
    {
      userId: volunteer3,
    },
    {
      userId: volunteer4,
    },
  ]

  for (const user of users) {
    await wrapInsert('users', pgQueries.insertVolunteerUser.run, { ...user })
  }

  for (const profile of profiles) {
    await wrapInsert(
      'volunteer_profiles',
      pgQueries.insertVolunteerProfile.run,
      { ...profile }
    )
  }

  for (const cert of certs) {
    await wrapInsert(
      'user_certifications',
      pgQueries.insertUserCertification.run,
      { ...cert }
    )
  }

  for (const quiz of quizzes) {
    await wrapInsert('user_quizzes', pgQueries.insertIntoUserQuizzes.run, {
      ...quiz,
    })
  }

  for (const admin of admins) {
    await wrapInsert('admin_profiles', pgQueries.insertAdminProfile.run, {
      ...admin,
    })
  }
}
