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
  const volunteer5 = getDbUlid()
  const volunteer6 = getDbUlid()

  const users = [
    {
      id: volunteer1,
      email: 'volunteer1@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Partner',
      lastName: 'UPchieve',
      referralCode: 'B',
      verified: true,
      phone: '+12125551212',
      testUser: false,
      timeTutored: (7 * 60 * 60 * 1000).toString(),
    },
    {
      id: volunteer2,
      email: 'volunteer2@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Special Reporting',
      lastName: 'UPchieve',
      referralCode: 'C',
      verified: true,
      phone: '+12125551213',
      testUser: false,
      timeTutored: (7 * 60 * 60 * 1000).toString(),
    },
    {
      id: volunteer3,
      email: 'volunteer3@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Open Sign Up',
      lastName: 'UPchieve',
      referralCode: 'D',
      verified: true,
      phone: '+12125551214',
      testUser: false,
      timeTutored: (7 * 60 * 60 * 1000).toString(),
    },
    {
      id: volunteer4,
      email: 'volunteer4@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Needs Onboarding',
      lastName: 'UPchieve',
      referralCode: 'E',
      verified: true,
      phone: '+12125551215',
      testUser: false,
      timeTutored: (0).toString(),
    },
    {
      id: volunteer5,
      email: 'volunteer5@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Needs Approval',
      lastName: 'UPchieve',
      referralCode: 'Z',
      verified: true,
      phone: '+12125551216',
      testUser: false,
      timeTutored: (0).toString(),
    },
    {
      id: volunteer6,
      email: 'volunteer6@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Admin',
      lastName: 'UPchieve',
      referralCode: 'Y',
      verified: true,
      phone: '+12125551217',
      testUser: false,
      timeTutored: (0).toString(),
    },
  ]

  const userMap: NameToId = {}
  for (const user of users) {
    userMap[user.id] = await wrapInsert(
      'users',
      pgQueries.insertVolunteerUser.run,
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
    // approved/onboarded/member of partner org
    {
      userId: userMap[volunteer1] as string,
      timezone: 'America/New_York',
      approved: true,
      onboarded: true,
      college: 'Volunteer College',
      volunteerPartnerOrgId: vpoIds['Health Co'] as string,
    },
    // approved/onboarded/member of partner who gets special dashboard/reporting
    {
      userId: userMap[volunteer2] as string,
      timezone: 'America/New_York',
      approved: true,
      onboarded: true,
      college: 'Volunteer College',
      volunteerPartnerOrgId: vpoIds['Big Telecom'] as string,
    },
    // approved/onboarded/open sign up/not new york time zone
    {
      userId: userMap[volunteer3] as string,
      timezone: 'America/Denver',
      approved: true,
      onboarded: true,
      college: 'Volunteer College',
      volunteerPartnerOrgId: undefined,
    },
    // approved not onboarded
    {
      userId: userMap[volunteer4] as string,
      timezone: 'America/New_York',
      approved: true,
      onboarded: false,
      college: 'Volunteer College',
      volunteerPartnerOrgId: undefined,
    },
    // not approved or onboarded
    {
      userId: userMap[volunteer5] as string,
      timezone: 'America/New_York',
      approved: false,
      onboarded: false,
      college: 'Volunteer College',
      volunteerPartnerOrgId: undefined,
    },
    // admin
    {
      userId: userMap[volunteer6] as string,
      timezone: 'America/New_York',
      approved: true,
      onboarded: true,
      college: '',
      volunteerPartnerOrgId: undefined,
    },
  ]

  const certs = [
    {
      userId: userMap[volunteer1] as string,
      certificationId: certIds['prealgebra'] as number,
    },
    {
      userId: userMap[volunteer1] as string,
      certificationId: certIds['algebraOne'] as number,
    },
    {
      userId: userMap[volunteer1] as string,
      certificationId: certIds['algebraTwo'] as number,
    },
    {
      userId: userMap[volunteer1] as string,
      certificationId: certIds['planning'] as number,
    },
    {
      userId: userMap[volunteer1] as string,
      certificationId: certIds['biology'] as number,
    },
    {
      userId: userMap[volunteer1] as string,
      certificationId: certIds['calculusAB'] as number,
    },
    {
      userId: userMap[volunteer1] as string,
      certificationId: certIds['chemistry'] as number,
    },
    {
      userId: userMap[volunteer1] as string,
      certificationId: certIds['essays'] as number,
    },
    {
      userId: userMap[volunteer1] as string,
      certificationId: certIds['geometry'] as number,
    },
    {
      userId: userMap[volunteer1] as string,
      certificationId: certIds['physicsOne'] as number,
    },
    {
      userId: userMap[volunteer1] as string,
      certificationId: certIds['precalculus'] as number,
    },
    {
      userId: userMap[volunteer1] as string,
      certificationId: certIds['trigonometry'] as number,
    },
    {
      userId: userMap[volunteer1] as string,
      certificationId: certIds['humanitiesEssays'] as number,
    },
    {
      userId: userMap[volunteer2] as string,
      certificationId: certIds['prealgebra'] as number,
    },
    {
      userId: userMap[volunteer2] as string,
      certificationId: certIds['satMath'] as number,
    },
    {
      userId: userMap[volunteer2] as string,
      certificationId: certIds['usHistory'] as number,
    },
    {
      userId: userMap[volunteer2] as string,
      certificationId: certIds['algebraOne'] as number,
    },
    {
      userId: userMap[volunteer2] as string,
      certificationId: certIds['algebraTwo'] as number,
    },
    {
      userId: userMap[volunteer2] as string,
      certificationId: certIds['applications'] as number,
    },
    {
      userId: userMap[volunteer2] as string,
      certificationId: certIds['biology'] as number,
    },
    {
      userId: userMap[volunteer2] as string,
      certificationId: certIds['calculusAB'] as number,
    },
    {
      userId: userMap[volunteer2] as string,
      certificationId: certIds['chemistry'] as number,
    },
    {
      userId: userMap[volunteer2] as string,
      certificationId: certIds['essays'] as number,
    },
    {
      userId: userMap[volunteer2] as string,
      certificationId: certIds['geometry'] as number,
    },
    {
      userId: userMap[volunteer2] as string,
      certificationId: certIds['physicsOne'] as number,
    },
    {
      userId: userMap[volunteer2] as string,
      certificationId: certIds['planning'] as number,
    },
    {
      userId: userMap[volunteer2] as string,
      certificationId: certIds['precalculus'] as number,
    },
    {
      userId: userMap[volunteer2] as string,
      certificationId: certIds['trigonometry'] as number,
    },
    {
      userId: userMap[volunteer3] as string,
      certificationId: certIds['prealgebra'] as number,
    },
    {
      userId: userMap[volunteer3] as string,
      certificationId: certIds['algebraOne'] as number,
    },
    {
      userId: userMap[volunteer3] as string,
      certificationId: certIds['algebraTwo'] as number,
    },
    {
      userId: userMap[volunteer3] as string,
      certificationId: certIds['applications'] as number,
    },
    {
      userId: userMap[volunteer3] as string,
      certificationId: certIds['biology'] as number,
    },
    {
      userId: userMap[volunteer3] as string,
      certificationId: certIds['calculusAB'] as number,
    },
    {
      userId: userMap[volunteer3] as string,
      certificationId: certIds['chemistry'] as number,
    },
    {
      userId: userMap[volunteer3] as string,
      certificationId: certIds['essays'] as number,
    },
    {
      userId: userMap[volunteer3] as string,
      certificationId: certIds['geometry'] as number,
    },
    {
      userId: userMap[volunteer3] as string,
      certificationId: certIds['physicsOne'] as number,
    },
    {
      userId: userMap[volunteer3] as string,
      certificationId: certIds['planning'] as number,
    },
    {
      userId: userMap[volunteer3] as string,
      certificationId: certIds['precalculus'] as number,
    },
    {
      userId: userMap[volunteer3] as string,
      certificationId: certIds['trigonometry'] as number,
    },
  ]

  const quizzes = [
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['prealgebra'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['algebraOne'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['algebraTwo'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['applications'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['biology'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['calculusAB'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['chemistry'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['essays'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['geometry'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['physicsOne'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['planning'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['precalculus'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['trigonometry'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['humanitiesEssays'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['reading'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['upchieve101'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['usHistory'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer1] as string,
      quizId: quizIds['satMath'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer2] as string,
      quizId: quizIds['prealgebra'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer2] as string,
      quizId: quizIds['algebraOne'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer2] as string,
      quizId: quizIds['algebraTwo'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer2] as string,
      quizId: quizIds['applications'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer2] as string,
      quizId: quizIds['biology'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer2] as string,
      quizId: quizIds['calculusAB'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer2] as string,
      quizId: quizIds['chemistry'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer2] as string,
      quizId: quizIds['essays'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer2] as string,
      quizId: quizIds['geometry'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer2] as string,
      quizId: quizIds['physicsOne'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer2] as string,
      quizId: quizIds['planning'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer2] as string,
      quizId: quizIds['precalculus'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer2] as string,
      quizId: quizIds['trigonometry'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer3] as string,
      quizId: quizIds['prealgebra'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer3] as string,
      quizId: quizIds['algebraOne'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer3] as string,
      quizId: quizIds['algebraTwo'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer3] as string,
      quizId: quizIds['applications'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer3] as string,
      quizId: quizIds['biology'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer3] as string,
      quizId: quizIds['calculusAB'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer3] as string,
      quizId: quizIds['chemistry'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer3] as string,
      quizId: quizIds['essays'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer3] as string,
      quizId: quizIds['geometry'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer3] as string,
      quizId: quizIds['physicsOne'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer3] as string,
      quizId: quizIds['planning'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer3] as string,
      quizId: quizIds['precalculus'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: userMap[volunteer3] as string,
      quizId: quizIds['trigonometry'] as number,
      attempts: 1,
      passed: true,
    },
  ]

  const admins = [
    {
      userId: userMap[volunteer6] as string,
    },
  ]

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
