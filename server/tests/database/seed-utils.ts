import { faker } from '@faker-js/faker'
import { USER_BAN_TYPES } from '../../constants'
import { mocked } from 'jest-mock'
import * as PgClient from '../../db'
import { TransactionClient } from '../../db'
import { getDbUlid, Ulid, Uuid } from '../../models/pgUtils'
import { getEmail, getName } from '../mocks/generate'

export async function createTestUser(
  client: TransactionClient,
  overrides: {
    id?: Ulid
    email?: string
    lastName?: string
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
        overrides.lastName ?? faker.person.lastName(),
        overrides.email ?? getEmail(),
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

export async function createChapter(
  client: TransactionClient,
  closedAt: string | null = null
): Promise<Ulid> {
  const groupId = getDbUlid()
  await client.query(
    `INSERT INTO nths_groups (id, name, key, invite_code, closed_at) VALUES ($1, $2, $3, $4, $5)`,
    [groupId, getName(), `key-${groupId}`, groupId.slice(-6), closedAt]
  )
  return groupId
}

export type ChapterMemberOptions = {
  title?: string | null
  admin?: boolean
  joinedAt?: string
  deactivatedAt?: string | null
  banType?: USER_BAN_TYPES
  deleted?: boolean
  deactivated?: boolean
  testUser?: boolean
  volunteerProfile?: boolean
  onboarded?: boolean
  approved?: boolean
  highSchool?: boolean
}

export async function createChapterMember(
  client: TransactionClient,
  groupId: Ulid,
  options: ChapterMemberOptions = {}
): Promise<Ulid> {
  const { id } = await createTestUser(client, { banType: options.banType })
  await client.query(
    `UPDATE users SET test_user = $2, deactivated = $3, deleted = $4 WHERE id = $1`,
    [
      id,
      options.testUser ?? false,
      options.deactivated ?? false,
      options.deleted ?? false,
    ]
  )
  if (options.volunteerProfile) {
    await createTestVolunteer(client, id)
    await client.query(
      `UPDATE volunteer_profiles SET onboarded = $2, approved = $3 WHERE user_id = $1`,
      [id, options.onboarded ?? true, options.approved ?? true]
    )
  }
  if (options.highSchool) {
    await client.query(
      `INSERT INTO volunteer_occupations (user_id, occupation) VALUES ($1, 'A high school student')`,
      [id]
    )
  }
  await client.query(
    `INSERT INTO nths_group_members (nths_group_id, user_id, title, joined_at, deactivated_at)
     VALUES ($1, $2, $3, COALESCE($4::timestamptz, NOW()), $5)`,
    [
      groupId,
      id,
      options.title === undefined ? 'Member' : options.title,
      options.joinedAt ?? null,
      options.deactivatedAt ?? null,
    ]
  )
  await client.query(
    `INSERT INTO nths_group_member_roles (user_id, nths_group_id, role_id)
     SELECT $1, $2, id FROM nths_group_roles WHERE name = $3`,
    [id, groupId, options.admin ? 'admin' : 'member']
  )
  return id
}

export function sqlText(args: unknown[]): string {
  return typeof args[0] === 'string'
    ? args[0]
    : ((args[0] as { text?: string })?.text ?? '')
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
  userOverrides?: Parameters<typeof createTestUser>[1],
  studentOverrides?: { gradeLevelId?: number }
) {
  const user = await createTestUser(client, userOverrides)
  const student = (
    await client.query(
      'INSERT INTO student_profiles (user_id) VALUES ($1) RETURNING *',
      [user.id]
    )
  ).rows[0]

  if (studentOverrides?.gradeLevelId) {
    await client.query(
      'INSERT INTO users_grade_levels (user_id, signup_grade_level_id, grade_level_id) VALUES($1, $2, $2)',
      [user.id, studentOverrides?.gradeLevelId]
    )
  }

  return student
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

// db-mocks-setup's runInTransaction issues no BEGIN, so rollbacks and row locks
// are only observable inside a real transaction.
export function withRealTransaction(wrapClient?: (tc: any) => any) {
  mocked(PgClient).runInTransaction.mockImplementationOnce(
    async (cb, existingTc?: TransactionClient) => {
      if (existingTc) return await cb(existingTc)
      const tc = await (global as any).__TEST_DB_CLIENT__.connect()
      try {
        await tc.query('BEGIN')
        const result = await cb(wrapClient ? wrapClient(tc) : tc)
        await tc.query('COMMIT')
        return result
      } catch (err) {
        await tc.query('ROLLBACK')
        throw err
      } finally {
        tc.release()
      }
    }
  )
}
