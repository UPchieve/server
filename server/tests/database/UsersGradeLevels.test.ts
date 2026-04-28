/**
 * @group database/parallel
 */

import { getClient } from '../../db'

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
    const sixthGradeId = await getGradeLevelId('6th')
    const seventhGradeId = await getGradeLevelId('7th')

    await client.query(
      'INSERT INTO users_grade_levels (user_id, signup_grade_level_id, grade_level_id) VALUES ($1, $2, $2)',
      [studentId, sixthGradeId]
    )

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
    expect(confirm.rows[0].grade_level_id).toBe(sixthGradeId)
    expect(confirm.rows[0].signup_grade_level_id).toBe(sixthGradeId)
  })

  test('does not allow overwriting null `signup_grade_level_id`', async () => {
    const studentId = await getStudentId('student2@upchieve.org')
    const ninthGradeId = await getGradeLevelId('9th')
    const twelfthGradeId = await getGradeLevelId('12th')

    await client.query(
      'INSERT INTO users_grade_levels (user_id, grade_level_id) VALUES ($1, $2)',
      [studentId, ninthGradeId]
    )

    await expect(() =>
      client.query(
        'UPDATE users_grade_levels SET signup_grade_level_id = $1 WHERE user_id = $2',
        [twelfthGradeId, studentId]
      )
    ).rejects.toThrow('signup_grade_level_id cannot be changed after it is set')

    const confirm = await client.query(
      'SELECT * FROM users_grade_levels WHERE user_id = $1',
      [studentId]
    )
    expect(confirm.rowCount).toBe(1)
    expect(confirm.rows[0].grade_level_id).toBe(ninthGradeId)
    expect(confirm.rows[0].signup_grade_level_id).toBeNull()
  })
})
