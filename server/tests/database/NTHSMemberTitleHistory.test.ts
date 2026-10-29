/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import { Ulid } from '../../models/pgUtils'
import { createChapter, createChapterMember } from './seed-utils'

const client = getClient()

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
    const groupId = await createChapter(client)
    const userId = await createChapterMember(client, groupId, {
      title: initial,
    })
    if (update) {
      await client.query(
        `${update} WHERE nths_group_id = $1 AND user_id = $2`,
        [groupId, userId]
      )
    }

    expect(await getRecordedTitles(groupId, userId)).toEqual(expected)
  })
})
