/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import { createTestUser } from './seed-utils'

// Returns the start year of the current school year.
// We say that a new school year starts July 1.
// So, examples:
// - July 1 2026 returns 2026.
// - June 30 2026 returns 2025.
// - January 1 2026 returns 2025.
// - December 31 2025 returns 2025.
function currentSchoolYearStartYear(): number {
  const today = new Date()
  return today.getMonth() >= 6 ? today.getFullYear() : today.getFullYear() - 1
}

describe('current_grade_levels view', () => {
  const client = getClient()

  // School years run July 1 through June 30 of the following calendar year.
  // e.g., school year 2025-2026: starts 2025-07-01, ends 2026-06-30
  const sy = currentSchoolYearStartYear()
  const currentYearStart = `${sy}-07-01` // first day of current school year
  const currentYearEnd = `${sy + 1}-06-30` // last day of current school year
  const priorYearStart = `${sy - 1}-07-01` // first day of prior school year
  const priorYearEnd = `${sy}-06-30` // last day of prior school year
  const twoYearsAgoStart = `${sy - 2}-07-01` // first day of school year two years ago
  const twoYearsAgoEnd = `${sy - 1}-06-30` // last day of school year two years ago
  const sevenYearsAgoStart = `${sy - 7}-07-01` // first day of school year seven years ago

  async function insertUserGradeLevel(
    userId: string,
    gradeName: string,
    updatedAt: string
  ): Promise<void> {
    const gradeLevelId = (
      await client.query('SELECT id FROM grade_levels WHERE name = $1', [
        gradeName,
      ])
    ).rows[0].id
    await client.query(
      `INSERT INTO users_grade_levels (user_id, grade_level_id, updated_at)
       VALUES ($1, $2, $3::timestamptz)`,
      [userId, gradeLevelId, updatedAt]
    )
  }

  async function currentGradeName(userId: string): Promise<string | null> {
    const result = await client.query(
      'SELECT current_grade_name FROM current_grade_levels WHERE user_id = $1',
      [userId]
    )
    return result.rows[0]?.current_grade_name ?? null
  }

  test('user not in users_grade_levels does not appear in view', async () => {
    const user = await createTestUser(client)
    expect(await currentGradeName(user.id)).toBeNull()
  })

  describe('Other grade level', () => {
    test('stays Other with no years passed (first day of current school year)', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, 'Other', currentYearStart)
      expect(await currentGradeName(user.id)).toBe('Other')
    })

    test('stays Other after many years (July 1, seven school years ago)', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, 'Other', sevenYearsAgoStart)
      expect(await currentGradeName(user.id)).toBe('Other')
    })
  })

  describe('College grade level', () => {
    test('stays College with no years passed (first day of current school year)', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, 'College', currentYearStart)
      expect(await currentGradeName(user.id)).toBe('College')
    })

    test('stays College after many years (July 1, seven school years ago)', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, 'College', sevenYearsAgoStart)
      expect(await currentGradeName(user.id)).toBe('College')
    })

    test('6th grade caps at College after 7 years', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '6th', sevenYearsAgoStart)
      expect(await currentGradeName(user.id)).toBe('College')
    })

    test('6th grade caps at College after 100 years', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '6th', `${sy - 100}-07-01`)
      expect(await currentGradeName(user.id)).toBe('College')
    })
  })

  describe('no school years progression (updated in current school year)', () => {
    test('updated on the first day of the current school year returns original grade', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '8th', currentYearStart)
      expect(await currentGradeName(user.id)).toBe('8th')
    })

    test('updated August 1 of current school year returns original grade', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '10th', `${sy}-08-01`)
      expect(await currentGradeName(user.id)).toBe('10th')
    })

    test('updated November 15 of current school year returns original grade', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '9th', `${sy}-11-15`)
      expect(await currentGradeName(user.id)).toBe('9th')
    })

    test('updated Jan 1 of the current school year returns original grade', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '9th', `${sy + 1}-01-01`)
      expect(await currentGradeName(user.id)).toBe('9th')
    })

    test('updated on the last day of the current school year returns original grade', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '9th', currentYearEnd)
      expect(await currentGradeName(user.id)).toBe('9th')
    })
  })

  describe('single school year progression (updated in prior school year)', () => {
    test('updated on the first day of the prior school year advances one grade', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '8th', priorYearStart)
      expect(await currentGradeName(user.id)).toBe('9th')
    })

    test('updated August 1 of prior school year advances one grade', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '8th', `${sy - 1}-08-01`)
      expect(await currentGradeName(user.id)).toBe('9th')
    })

    test('updated November 15 of prior school year advances one grade', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '7th', `${sy - 1}-11-15`)
      expect(await currentGradeName(user.id)).toBe('8th')
    })

    test('updated Jan 1 of the prior school year advances one grade', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '9th', `${sy}-01-01`)
      expect(await currentGradeName(user.id)).toBe('10th')
    })

    test('updated on the last day of the prior school year advances one grade', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '9th', priorYearEnd)
      expect(await currentGradeName(user.id)).toBe('10th')
    })
  })

  describe('two school years progression', () => {
    test('updated on the first day of the school year two years ago advances two grades', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '6th', twoYearsAgoStart)
      expect(await currentGradeName(user.id)).toBe('8th')
    })

    test('updated on the last day of the school year two years ago advances two grades', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '6th', twoYearsAgoEnd)
      expect(await currentGradeName(user.id)).toBe('8th')
    })
  })

  describe('several school years progression', () => {
    test('updated July 1 three school years ago advances three grades', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '6th', `${sy - 3}-07-01`)
      expect(await currentGradeName(user.id)).toBe('9th')
    })

    test('updated July 1 four school years ago advances four grades', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '6th', `${sy - 4}-07-01`)
      expect(await currentGradeName(user.id)).toBe('10th')
    })
  })

  describe('July 1 vs June 30 school year boundary', () => {
    test('first day of current school year and last day of prior school year differ by one year', async () => {
      const userJuly = await createTestUser(client)
      const userJune = await createTestUser(client)
      await insertUserGradeLevel(userJuly.id, '9th', currentYearStart)
      await insertUserGradeLevel(userJune.id, '9th', priorYearEnd)
      expect(await currentGradeName(userJuly.id)).toBe('9th') // 0 years passed
      expect(await currentGradeName(userJune.id)).toBe('10th') // 1 year passed
    })

    test('first day of prior school year and last day of school year two years ago differ by one year', async () => {
      const userJuly = await createTestUser(client)
      const userJune = await createTestUser(client)
      await insertUserGradeLevel(userJuly.id, '9th', priorYearStart)
      await insertUserGradeLevel(userJune.id, '9th', twoYearsAgoEnd)
      expect(await currentGradeName(userJuly.id)).toBe('10th') // 1 year passed
      expect(await currentGradeName(userJune.id)).toBe('11th') // 2 years passed
    })
  })

  describe('all grade transitions after one school year', () => {
    const oneYearAgo = priorYearStart

    test('6th advances to 7th', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '6th', oneYearAgo)
      expect(await currentGradeName(user.id)).toBe('7th')
    })

    test('7th advances to 8th', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '7th', oneYearAgo)
      expect(await currentGradeName(user.id)).toBe('8th')
    })

    test('8th advances to 9th', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '8th', oneYearAgo)
      expect(await currentGradeName(user.id)).toBe('9th')
    })

    test('9th advances to 10th', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '9th', oneYearAgo)
      expect(await currentGradeName(user.id)).toBe('10th')
    })

    test('10th advances to 11th', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '10th', oneYearAgo)
      expect(await currentGradeName(user.id)).toBe('11th')
    })

    test('11th advances to 12th', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '11th', oneYearAgo)
      expect(await currentGradeName(user.id)).toBe('12th')
    })

    test('12th advances to College', async () => {
      const user = await createTestUser(client)
      await insertUserGradeLevel(user.id, '12th', oneYearAgo)
      expect(await currentGradeName(user.id)).toBe('College')
    })
  })
})
