import pool from '../../pg-pool'
import * as db from 'zapatos/db'
import { getDbUlid, getIdByNameFailsafe } from '../utils'

export async function volunteers() {
  const volunteer1 = getDbUlid()
  const volunteer2 = getDbUlid()
  const volunteer3 = getDbUlid()
  const volunteer4 = getDbUlid()

  await db
    .insert('users', [
      {
        id: volunteer1,
        created_at: new Date(),
        updated_at: new Date(),
        email: 'volunteer1@upchieve.org',
        password:
          '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
        first_name: 'Volunteer',
        last_name: 'UPchieve',
        referral_code: 'B',
        verified: true,
        // phone: '+12125551212',
        time_tutored: 7 * 60 * 60 * 1000,
      },
      {
        id: volunteer2,
        created_at: new Date(),
        updated_at: new Date(),
        email: 'volunteer2@upchieve.org',
        password:
          '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
        first_name: 'Volunteer',
        last_name: 'UPchieve',
        referral_code: 'C',
        // phone: '+12125551212',
        verified: true,
      },
      {
        id: volunteer3,
        created_at: new Date(),
        updated_at: new Date(),
        email: 'volunteer3@upchieve.org',
        password:
          '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
        first_name: 'Volunteer',
        last_name: 'UPchieve',
        referral_code: 'D',
        verified: true,
        // phone: '+12125551212',
        test_user: true,
      },
      {
        id: volunteer4,
        created_at: new Date(),
        updated_at: new Date(),
        email: 'volunteer3@upchieve.org',
        password:
          '$2a$10$z.JMHnbX9IubnNZtqI.FOecTPVY1VTU1DJ6AJGIOT/x/OyAtdw3.y',
        first_name: 'Volunteer',
        last_name: 'UPchieve',
        referral_code: 'E',
        verified: true,
        // phone: '+12125551212',
        test_user: true,
      },
    ])
    .run(pool)

  await db
    .insert('volunteer_profiles', [
      {
        user_id: volunteer1,
        timezone: 'America/New_York',
        approved: true,
        onboarded: true,
        college: 'Volunteer College',
        created_at: new Date(),
        updated_at: new Date(),
        volunteer_partner_org_id: await getIdByNameFailsafe(
          'volunteer_partner_orgs',
          'Placeholder 1'
        ),
      },
      {
        user_id: volunteer2,
        timezone: 'America/New_York',
        approved: true,
        onboarded: false,
        college: 'Volunteer College',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer3,
        timezone: 'America/New_York',
        approved: false,
        onboarded: false,
        college: 'Volunteer College',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer4,
        timezone: 'America/New_York',
        approved: false,
        onboarded: false,
        college: 'Volunteer College',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
    .run(pool)

  await db
    .insert('users_certifications', [
      {
        user_id: volunteer1,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'prealgebra'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'algebraOne'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'algebraTwo'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'application'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'biology'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'calculus'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'chemistry'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        certification_id: await getIdByNameFailsafe('certifications', 'essays'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'geometry'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'physicsOne'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'planning'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'precalculus'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'trigonometry'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'humanitiesEssays'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'prealgebra'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'algebraOne'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'algebraTwo'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'application'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'biology'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'calculus'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'chemistry'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        certification_id: await getIdByNameFailsafe('certifications', 'essays'),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'geometry'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'physicsOne'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'planning'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'precalculus'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        certification_id: await getIdByNameFailsafe(
          'certifications',
          'trigonometry'
        ),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
    .run(pool)

  await db
    .insert('users_quizzes', [
      {
        user_id: volunteer1,
        quiz_id: await getIdByNameFailsafe('quizzes', 'prealgebra'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        quiz_id: await getIdByNameFailsafe('quizzes', 'algebraOne'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        quiz_id: await getIdByNameFailsafe('quizzes', 'algebraTwo'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        quiz_id: await getIdByNameFailsafe('quizzes', 'application'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        quiz_id: await getIdByNameFailsafe('quizzes', 'biology'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        quiz_id: await getIdByNameFailsafe('quizzes', 'calculus'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        quiz_id: await getIdByNameFailsafe('quizzes', 'chemistry'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        quiz_id: await getIdByNameFailsafe('quizzes', 'essays'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        quiz_id: await getIdByNameFailsafe('quizzes', 'geometry'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        quiz_id: await getIdByNameFailsafe('quizzes', 'physicsOne'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        quiz_id: await getIdByNameFailsafe('quizzes', 'planning'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        quiz_id: await getIdByNameFailsafe('quizzes', 'precalculus'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        quiz_id: await getIdByNameFailsafe('quizzes', 'trigonometry'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer1,
        quiz_id: await getIdByNameFailsafe('quizzes', 'humanitiesEssays'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        quiz_id: await getIdByNameFailsafe('quizzes', 'prealgebra'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        quiz_id: await getIdByNameFailsafe('quizzes', 'algebraOne'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        quiz_id: await getIdByNameFailsafe('quizzes', 'algebraTwo'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        quiz_id: await getIdByNameFailsafe('quizzes', 'application'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        quiz_id: await getIdByNameFailsafe('quizzes', 'biology'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        quiz_id: await getIdByNameFailsafe('quizzes', 'calculus'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        quiz_id: await getIdByNameFailsafe('quizzes', 'chemistry'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        quiz_id: await getIdByNameFailsafe('quizzes', 'essays'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        quiz_id: await getIdByNameFailsafe('quizzes', 'geometry'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        quiz_id: await getIdByNameFailsafe('quizzes', 'physicsOne'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        quiz_id: await getIdByNameFailsafe('quizzes', 'planning'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        quiz_id: await getIdByNameFailsafe('quizzes', 'precalculus'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        quiz_id: await getIdByNameFailsafe('quizzes', 'trigonometry'),
        attempts: 1,
        passed: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
    .run(pool)

  await db
    .insert('admin_profiles', [
      {
        user_id: volunteer1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: volunteer4,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
    .run(pool)
}
