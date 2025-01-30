import { faker } from '@faker-js/faker'
import { TransactionClient } from '../../db'
import { getDbUlid, Ulid, Uuid } from '../../models/pgUtils'

export async function createTestUser(
  client: TransactionClient
): Promise<{ id: string }> {
  return (
    await client.query(
      'INSERT INTO users (id, first_name, last_name, email, referral_code) VALUES($1, $2, $3, $4, $5) RETURNING id',
      [
        getDbUlid(),
        faker.person.firstName(),
        faker.person.lastName(),
        faker.internet.email(),
        faker.string.alphanumeric(20),
      ]
    )
  ).rows[0]
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

export async function createTestStudent(client: TransactionClient) {
  const user = await createTestUser(client)
  return (
    await client.query(
      'INSERT INTO student_profiles (user_id) VALUES ($1) RETURNING user_id',
      [user.id]
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
