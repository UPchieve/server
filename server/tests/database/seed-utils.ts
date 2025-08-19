import { faker } from '@faker-js/faker'
import { USER_BAN_TYPES } from '../../constants'
import { TransactionClient } from '../../db'
import { getDbUlid, Ulid, Uuid } from '../../models/pgUtils'

export async function createTestUser(
  client: TransactionClient,
  overrides: {
    id?: Ulid
    email?: string
    referredById?: Ulid
    banType?: USER_BAN_TYPES
  } = {}
): Promise<{ id: Ulid }> {
  const user = (
    await client.query(
      `INSERT INTO users (id, first_name, last_name, email, referral_code, ban_type)
       VALUES($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        overrides.id ?? getDbUlid(),
        faker.person.firstName(),
        faker.person.lastName(),
        overrides.email ?? faker.internet.email(),
        faker.string.alphanumeric(20),
        overrides.banType ?? null,
      ]
    )
  ).rows[0]

  if (overrides.referredById) {
    await createTestUser(client, { id: overrides.referredById })
    await client.query(
      `INSERT INTO referrals (user_id, referred_by) VALUES($1, $2)`,
      [user.id, overrides.referredById]
    )
  }

  return user
}

export async function createTestTeacher(
  userId: Ulid,
  client: TransactionClient
) {
  await client.query(
    'INSERT INTO teacher_profiles (user_id, created_at, updated_at) VALUES ($1, NOW(), NOW())',
    [userId]
  )
}

export async function createTestStudent(
  client: TransactionClient,
  userOverrides?: { email?: string },
  studentOverrides?: { gradeLevelId?: number }
) {
  const user = await createTestUser(client, userOverrides)
  return (
    await client.query(
      'INSERT INTO student_profiles (user_id, grade_level_id) VALUES ($1, $2) RETURNING *',
      [user.id, studentOverrides?.gradeLevelId]
    )
  ).rows[0]
}

export async function createTestVolunteer(
  client: TransactionClient,
  userId: Ulid,
  overrides: { photoIdS3Key?: string } = {}
) {
  return (
    await client.query(
      `INSERT INTO volunteer_profiles (user_id, photo_id_s3_key) VALUES ($1, $2)`,
      [userId, overrides.photoIdS3Key ?? null]
    )
  ).rows[0]
}

export async function createTestTeacherClass(
  client: TransactionClient
): Promise<{ id: Ulid }> {
  const user = await createTestUser(client)
  await createTestTeacher(user.id, client)
  return (
    await client.query(
      'INSERT INTO teacher_classes (id, user_id, name, code, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING id',
      [getDbUlid(), user.id, faker.lorem.word(2), faker.lorem.slug()]
    )
  ).rows[0]
}

export async function addTestStudentToTestTeacherClass(
  studentId: Ulid,
  classId: Uuid,
  client: TransactionClient
) {
  await client.query(
    'INSERT INTO student_classes (user_id, class_id) VALUES ($1, $2)',
    [studentId, classId]
  )
}
