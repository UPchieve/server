/**
 * @group database/parallel
 */
import { getClient } from '../../../db'
import { createTestStudent } from '../seed-utils'
import backfillUsersGradeLevels from '../../../scripts/backfill-users-grade-levels'

const client = getClient()

describe('backfillUsersGradeLevels', () => {
  test('inserts a row for each student with a grade_level_id', async () => {
    const userId1 = (
      await createTestStudent(
        client,
        { email: 'user1@inserttest.com' },
        { gradeLevelId: 1 }
      )
    ).user_id
    const userId2 = (
      await createTestStudent(
        client,
        { email: 'user2@inserttest.com' },
        { gradeLevelId: 4 }
      )
    ).user_id

    const before = await client.query(
      'SELECT * FROM users_grade_levels WHERE user_id IN ($1, $2)',
      [userId1, userId2]
    )
    expect(before.rowCount).toBe(0)

    await backfillUsersGradeLevels()

    const after = await client.query(
      'SELECT * FROM users_grade_levels WHERE user_id IN ($1, $2)',
      [userId1, userId2]
    )
    expect(after.rowCount).toBe(2)
    after.rows.forEach((row) => {
      expect(row.grade_level_id).toBeDefined()
      expect(row.signup_grade_level_id).toBeDefined()
    })
  })

  test('skips students without a grade_level_id', async () => {
    const userIdWithGrade = (
      await createTestStudent(
        client,
        { email: 'userwithgrade@test.com' },
        { gradeLevelId: 2 }
      )
    ).user_id
    const userIdWithoutGrade = (
      await createTestStudent(client, { email: 'userwithoutgrade@test.com' })
    ).user_id

    const before = await client.query(
      'SELECT * FROM users_grade_levels WHERE user_id IN ($1, $2)',
      [userIdWithGrade, userIdWithoutGrade]
    )
    expect(before.rowCount).toBe(0)

    await backfillUsersGradeLevels()

    const after = await client.query(
      'SELECT * FROM users_grade_levels WHERE user_id IN ($1, $2)',
      [userIdWithGrade, userIdWithoutGrade]
    )
    expect(after.rowCount).toBe(1)
    expect(after.rows[0].user_id).toBe(userIdWithGrade)
    expect(after.rows[0].signup_grade_level_id).toBe(2)
    expect(after.rows[0].grade_level_id).toBe(2)
  })

  test('does not overwrite an existing users_grade_levels row', async () => {
    const userId = (
      await createTestStudent(
        client,
        { email: 'exists@test.com' },
        { gradeLevelId: 3 }
      )
    ).user_id
    const otherGradeLevelId = 1
    await client.query(
      `INSERT INTO users_grade_levels (user_id, signup_grade_level_id, grade_level_id, updated_at)
       VALUES ($1, $2, $2, NOW())`,
      [userId, otherGradeLevelId]
    )

    await backfillUsersGradeLevels()

    const result = await client.query(
      'SELECT * FROM users_grade_levels WHERE user_id = $1',
      [userId]
    )
    expect(result.rowCount).toBe(1)
    expect(result.rows[0].grade_level_id).toBe(otherGradeLevelId)
    expect(result.rows[0].signup_grade_level_id).toBe(otherGradeLevelId)
  })

  test('backfills `student_profile.created_at` as the `users_grade_levels.updated_at`', async () => {
    const user = await createTestStudent(
      client,
      { email: 'created_at@test.com' },
      { gradeLevelId: 5 }
    )

    await backfillUsersGradeLevels()

    const result = await client.query(
      'SELECT * FROM users_grade_levels WHERE user_id = $1',
      [user.user_id]
    )
    expect(result.rowCount).toBe(1)
    expect(result.rows[0].updated_at).toEqual(user.created_at)
  })
})
