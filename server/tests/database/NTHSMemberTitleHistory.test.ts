/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import { getDbUlid, Ulid } from '../../models/pgUtils'
import { getName } from '../mocks/generate'
import { createTestUser } from './seed-utils'

const client = getClient()

async function createChapter(): Promise<Ulid> {
  const groupId = getDbUlid()
  await client.query(
    `INSERT INTO nths_groups (id, name, key, invite_code) VALUES ($1, $2, $3, $4)`,
    [groupId, getName(), `key-${groupId}`, groupId.slice(-6)]
  )
  return groupId
}

async function addMember(
  groupId: Ulid,
  title: string | null = 'Member'
): Promise<Ulid> {
  const user = await createTestUser(client)
  await client.query(
    `INSERT INTO nths_group_members (nths_group_id, user_id, title) VALUES ($1, $2, $3)`,
    [groupId, user.id, title]
  )
  return user.id
}

async function getRecordedTitles(
  groupId: Ulid,
  userId: Ulid
): Promise<(string | null)[]> {
  const { rows } = await client.query(
    `SELECT title FROM nths_group_member_title_histories
     WHERE nths_group_id = $1 AND user_id = $2
     ORDER BY recorded_at`,
    [groupId, userId]
  )
  return rows.map((row) => row.title)
}

describe('nths_group_members title history', () => {
  test.each([
    {
      name: 'a new membership records its title',
      initial: 'Member',
      update: null,
      expected: ['Member'],
    },
    {
      name: 'a title change records the new title',
      initial: 'Member',
      update: `UPDATE nths_group_members SET title = 'President'`,
      expected: ['Member', 'President'],
    },
    {
      name: 'a title set where there was none is recorded',
      initial: null,
      update: `UPDATE nths_group_members SET title = 'President'`,
      expected: [null, 'President'],
    },
    {
      name: 'saving the same title records nothing',
      initial: 'Member',
      update: `UPDATE nths_group_members SET title = 'Member'`,
      expected: ['Member'],
    },
  ])('$name', async ({ initial, update, expected }) => {
    const groupId = await createChapter()
    const userId = await addMember(groupId, initial)
    if (update) {
      await client.query(
        `${update} WHERE nths_group_id = $1 AND user_id = $2`,
        [groupId, userId]
      )
    }

    expect(await getRecordedTitles(groupId, userId)).toEqual(expected)
  })
})
