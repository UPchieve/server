/**
 * @group database/parallel
 */

import { getClient } from '../../db'

describe('UsersGradeLevels', () => {
  const client = getClient()

  test('does not allow overwriting `initial_grade_level_id`', async () => {
    const studentId = (
      await client.query('SELECT id FROM users WHERE email = $1', [
        'student1@upchieve.org',
      ])
    ).rows[0].id
    const sixthGradeId = (
      await client.query('SELECT id FROM grade_levels WHERE name = $1', ['6th'])
    ).rows[0].id
    const seventhGradeId = (
      await client.query('SELECT id FROM grade_levels WHERE name = $1', ['7th'])
    ).rows[0].id

    await client.query(
      'INSERT INTO users_grade_levels (user_id, initial_grade_level_id, grade_level_id) VALUES ($1, $2, $2)',
      [studentId, sixthGradeId]
    )

    await expect(() =>
      client.query(
        'UPDATE users_grade_levels SET initial_grade_level_id = $1 WHERE user_id = $2',
        [seventhGradeId, studentId]
      )
    ).rejects.toThrow(
      'initial_grade_level_id cannot be changed after it is set'
    )
  })
})
