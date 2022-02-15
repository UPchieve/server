import { wrapInsert, NameToId, getDbUlid } from '../utils'
import * as pgQueries from './pg.queries'

export async function volunteers(
  vpoIds: NameToId,
  certIds: NameToId,
  quizIds: NameToId,
  weekdayIds: NameToId,
  photoIds: NameToId
): Promise<NameToId> {
  const volunteer1 = getDbUlid() // default tutor
  const volunteer2 = getDbUlid() // unverified
  const volunteer3 = getDbUlid() // partner tutor
  const volunteer4 = getDbUlid() // no references or ID
  const volunteer5 = getDbUlid() // ready for approval
  const volunteer6 = getDbUlid() // no upchieve101
  const volunteer7 = getDbUlid() // no subjects
  const volunteer8 = getDbUlid() // inactive30
  const volunteer9 = getDbUlid() // inactive90

  const users = [
    {
      id: volunteer1,
      email: 'volunteer1@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Volunteer 1',
      lastName: 'open, verified, admin, ready to tutor',
      referralCode: 'B',
      verified: true,
      phone: '+12125551211',
      testUser: false,
      timeTutored: (7 * 60 * 60 * 1000).toString(),
    },
    {
      id: volunteer2,
      email: 'volunteer2@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Volunteer 2',
      lastName: 'open, unverified',
      referralCode: 'C',
      verified: false,
      phone: '+12125551212',
      testUser: false,
      timeTutored: (0).toString(),
    },
    {
      id: volunteer3,
      email: 'volunteer3@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Volunteer 3',
      lastName: 'partner, verified, referred, ready to tutor',
      referralCode: 'D',
      verified: true,
      phone: '+12125551213',
      testUser: false,
      timeTutored: (0).toString(),
      referredBy: volunteer1,
    },
    {
      id: volunteer4,
      email: 'volunteer4@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Volunteer 4',
      lastName: 'open, no reference',
      referralCode: 'E',
      verified: true,
      phone: '+12125551214',
      testUser: false,
      timeTutored: (0).toString(),
    },
    {
      id: volunteer5,
      email: 'volunteer5@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Volunteer 5',
      lastName: 'open, ready for approval',
      referralCode: 'Z',
      verified: true,
      phone: '+12125551215',
      testUser: false,
      timeTutored: (0).toString(),
    },
    {
      id: volunteer6,
      email: 'volunteer6@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Volunteer 6',
      lastName: 'open, approved, no upchieve101',
      referralCode: 'Y',
      verified: true,
      phone: '+12125551216',
      testUser: false,
      timeTutored: (0).toString(),
    },
    {
      id: volunteer7,
      email: 'volunteer7@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Volunteer 7',
      lastName: 'open, approved, no subjects',
      referralCode: 'X',
      verified: true,
      phone: '+12125551217',
      testUser: false,
      timeTutored: (0).toString(),
    },
    {
      id: volunteer8,
      email: 'volunteer8@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Volunteer 8',
      lastName: 'open, ready to tutor, inactive 30 days',
      referralCode: 'W',
      verified: true,
      phone: '+12125551218',
      testUser: false,
      timeTutored: (0).toString(),
    },
    {
      id: volunteer9,
      email: 'volunteer9@upchieve.org',
      password: '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
      firstName: 'Volunteer 9',
      lastName: 'open, ready to tutor, inactive 90 days',
      referralCode: 'E',
      verified: true,
      phone: '+12125551219',
      testUser: false,
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
      volunteerPartnerOrgId: undefined,
      photoIdStatus: photoIds['approved'] as number,
    },
    {
      userId: volunteer2,
      timezone: 'America/New_York',
      approved: false,
      onboarded: false,
      college: 'Volunteer College',
      volunteerPartnerOrgId: undefined,
      photoIdStatus: undefined,
    },
    {
      userId: volunteer3,
      timezone: 'America/New_York',
      approved: true,
      onboarded: true,
      college: 'Volunteer College',
      volunteerPartnerOrgId: vpoIds['Placeholder 1'] as string,
      photoIdStatus: photoIds['approved'] as number,
    },
    {
      userId: volunteer4,
      timezone: 'America/New_York',
      approved: false,
      onboarded: false,
      college: 'Volunteer College',
      volunteerPartnerOrgId: undefined,
      photoIdStatus: undefined,
    },
    {
      userId: volunteer5,
      timezone: 'America/New_York',
      approved: false,
      onboarded: false,
      college: 'Volunteer College',
      volunteerPartnerOrgId: undefined,
      photoIdStatus: photoIds['approved'] as number,
    },
    {
      userId: volunteer6,
      timezone: 'America/New_York',
      approved: true,
      onboarded: false,
      college: 'Volunteer College',
      volunteerPartnerOrgId: undefined,
      photoIdStatus: photoIds['approved'] as number,
    },
    {
      userId: volunteer7,
      timezone: 'America/New_York',
      approved: true,
      onboarded: false,
      college: 'Volunteer College',
      volunteerPartnerOrgId: undefined,
      photoIdStatus: photoIds['approved'] as number,
    },
    {
      userId: volunteer8,
      timezone: 'America/New_York',
      approved: true,
      onboarded: true,
      college: 'Volunteer College',
      volunteerPartnerOrgId: undefined,
      photoIdStatus: photoIds['approved'] as number,
    },
    {
      userId: volunteer9,
      timezone: 'America/New_York',
      approved: true,
      onboarded: true,
      college: 'Volunteer College',
      volunteerPartnerOrgId: undefined,
      photoIdStatus: photoIds['approved'] as number,
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
      userId: volunteer3,
      certificationId: certIds['prealgebra'] as number,
    },
    {
      userId: volunteer3,
      certificationId: certIds['algebraOne'] as number,
    },
    {
      userId: volunteer3,
      certificationId: certIds['algebraTwo'] as number,
    },
    // {
    //   userId: volunteer3,
    //   certificationId: await getIdByNameFailsafe(
    //     'certifications',
    //     'application'
    //   ] as number,
    //   created_at: new Date(] as number,
    //   updated_at: new Date(] as number,
    // },
    {
      userId: volunteer3,
      certificationId: certIds['biology'] as number,
    },
    {
      userId: volunteer3,
      certificationId: certIds['calculusAB'] as number,
    },
    {
      userId: volunteer3,
      certificationId: certIds['chemistry'] as number,
    },
    {
      userId: volunteer3,
      certificationId: certIds['essays'] as number,
    },
    {
      userId: volunteer3,
      certificationId: certIds['geometry'] as number,
    },
    {
      userId: volunteer3,
      certificationId: certIds['physicsOne'] as number,
    },
    // {
    //   userId: volunteer3,
    //   certificationId: await getIdByNameFailsafe(
    //     'certifications',
    //     'planning'
    //   ] as number,
    //   created_at: new Date(] as number,
    //   updated_at: new Date(] as number,
    // },
    {
      userId: volunteer3,
      certificationId: certIds['precalculus'] as number,
    },
    {
      userId: volunteer3,
      certificationId: certIds['trigonometry'] as number,
    },
    {
      userId: volunteer8,
      certificationId: certIds['prealgebra'] as number,
    },
    {
      userId: volunteer9,
      certificationId: certIds['prealgebra'] as number,
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
      userId: volunteer3,
      quizId: quizIds['prealgebra'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer3,
      quizId: quizIds['algebraOne'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer3,
      quizId: quizIds['algebraTwo'] as number,
      attempts: 1,
      passed: true,
    },
    // {
    //   userId: volunteer3,
    //   quizId: quizIds['application'] as number,
    //   attempts: 1,
    //   passed: true,
    //   created_at: new Date(] as number,
    //   updated_at: new Date(] as number,
    // },
    {
      userId: volunteer3,
      quizId: quizIds['biology'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer3,
      quizId: quizIds['calculusAB'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer3,
      quizId: quizIds['chemistry'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer3,
      quizId: quizIds['essays'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer3,
      quizId: quizIds['geometry'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer3,
      quizId: quizIds['physicsOne'] as number,
      attempts: 1,
      passed: true,
    },
    // {
    //   userId: volunteer3,
    //   quizId: quizIds['planning'] as number,
    //   attempts: 1,
    //   passed: true,
    //   created_at: new Date(] as number,
    //   updated_at: new Date(] as number,
    // },
    {
      userId: volunteer3,
      quizId: quizIds['precalculus'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer3,
      quizId: quizIds['trigonometry'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer8,
      quizId: quizIds['prealgebra'] as number,
      attempts: 1,
      passed: true,
    },
    {
      userId: volunteer9,
      quizId: quizIds['prealgebra'] as number,
      attempts: 1,
      passed: true,
    },
  ]

  const admins = [
    {
      userId: volunteer1,
    },
  ]

  const availabilities = [
    {
      id: getDbUlid(),
      userId: volunteer1,
      weekdayId: weekdayIds['Monday'] as number,
      availableStart: 13,
      availableEnd: 15,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer1,
      weekdayId: weekdayIds['Monday'] as number,
      availableStart: 21,
      availableEnd: 24,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer1,
      weekdayId: weekdayIds['Wednesday'] as number,
      availableStart: 14,
      availableEnd: 16,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer1,
      weekdayId: weekdayIds['Wednesday'] as number,
      availableStart: 19,
      availableEnd: 20,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer1,
      weekdayId: weekdayIds['Saturday'] as number,
      availableStart: 10,
      availableEnd: 13,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer1,
      weekdayId: weekdayIds['Sunday'] as number,
      availableStart: 9,
      availableEnd: 13,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer3,
      weekdayId: weekdayIds['Monday'] as number,
      availableStart: 13,
      availableEnd: 15,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer3,
      weekdayId: weekdayIds['Monday'] as number,
      availableStart: 13,
      availableEnd: 15,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer3,
      weekdayId: weekdayIds['Monday'] as number,
      availableStart: 21,
      availableEnd: 24,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer3,
      weekdayId: weekdayIds['Wednesday'] as number,
      availableStart: 14,
      availableEnd: 16,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer3,
      weekdayId: weekdayIds['Wednesday'] as number,
      availableStart: 19,
      availableEnd: 20,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer3,
      weekdayId: weekdayIds['Saturday'] as number,
      availableStart: 10,
      availableEnd: 13,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer3,
      weekdayId: weekdayIds['Sunday'] as number,
      availableStart: 9,
      availableEnd: 13,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer3,
      weekdayId: weekdayIds['Monday'] as number,
      availableStart: 13,
      availableEnd: 15,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer8,
      weekdayId: weekdayIds['Monday'] as number,
      availableStart: 13,
      availableEnd: 15,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer8,
      weekdayId: weekdayIds['Monday'] as number,
      availableStart: 21,
      availableEnd: 24,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer8,
      weekdayId: weekdayIds['Wednesday'] as number,
      availableStart: 14,
      availableEnd: 16,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer8,
      weekdayId: weekdayIds['Wednesday'] as number,
      availableStart: 19,
      availableEnd: 20,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer8,
      weekdayId: weekdayIds['Saturday'] as number,
      availableStart: 10,
      availableEnd: 13,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer8,
      weekdayId: weekdayIds['Sunday'] as number,
      availableStart: 9,
      availableEnd: 13,
      timezone: 'America/New_York',
    },
    {
      id: getDbUlid(),
      userId: volunteer8,
      weekdayId: weekdayIds['Monday'] as number,
      availableStart: 13,
      availableEnd: 15,
      timezone: 'America/New_York',
    },
  ]

  const temp: any = {}
  for (const user of users) {
    temp[user.firstName] = await wrapInsert(
      'users',
      pgQueries.insertVolunteerUser.run,
      { ...user }
    )
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

  for (const availability of availabilities) {
    await wrapInsert('availabilities', pgQueries.insertAvailability.run, {
      ...availability,
    })
  }

  return temp
}
