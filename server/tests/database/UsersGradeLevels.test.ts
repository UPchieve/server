/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import { createTestStudent } from './seed-utils'

describe('UsersGradeLevels', () => {
  const client = getClient()

  async function getGradeLevelId(name: string) {
    return (
      await client.query('SELECT id FROM grade_levels WHERE name = $1', [name])
    ).rows[0].id
  }

  async function getStudentId(email: string) {
    return (
      await client.query('SELECT id FROM users WHERE email = $1', [email])
    ).rows[0].id
  }

  test('does not allow overwriting `signup_grade_level_id`', async () => {
    const studentId = await getStudentId('student1@upchieve.org')
    const eigthGradeId = await getGradeLevelId('8th')
    const seventhGradeId = await getGradeLevelId('7th')

    await expect(() =>
      client.query(
        'UPDATE users_grade_levels SET signup_grade_level_id = $1 WHERE user_id = $2',
        [seventhGradeId, studentId]
      )
    ).rejects.toThrow('signup_grade_level_id cannot be changed after it is set')

    const confirm = await client.query(
      'SELECT * FROM users_grade_levels WHERE user_id = $1',
      [studentId]
    )
    expect(confirm.rowCount).toBe(1)
    expect(confirm.rows[0].grade_level_id).toBe(eigthGradeId)
    expect(confirm.rows[0].signup_grade_level_id).toBe(eigthGradeId)
  })

  test('does not allow overwriting null `signup_grade_level_id`', async () => {
    const student = await createTestStudent(client)
    const ninthGradeId = await getGradeLevelId('9th')
    const twelfthGradeId = await getGradeLevelId('12th')

    await client.query(
      'INSERT INTO users_grade_levels (user_id, grade_level_id) VALUES ($1, $2)',
      [student.user_id, ninthGradeId]
    )

    await expect(() =>
      client.query(
        'UPDATE users_grade_levels SET signup_grade_level_id = $1 WHERE user_id = $2',
        [twelfthGradeId, student.user_id]
      )
    ).rejects.toThrow('signup_grade_level_id cannot be changed after it is set')

    const confirm = await client.query(
      'SELECT * FROM users_grade_levels WHERE user_id = $1',
      [student.user_id]
    )
    expect(confirm.rowCount).toBe(1)
    expect(confirm.rows[0].grade_level_id).toBe(ninthGradeId)
    expect(confirm.rows[0].signup_grade_level_id).toBeNull()
  })
})
