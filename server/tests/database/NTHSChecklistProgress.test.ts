/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import {
  getNTHSChecklistProgressByGroupId,
  insertNTHSChecklistItemProgressIfMissing,
  upsertNTHSChecklistItemProgress,
} from '../../models/NTHSChecklistProgress'
import { getCanonicalDbUlid, Ulid } from '../../models/pgUtils'
import { createTestUser } from './seed-utils'

const client = getClient()

async function createChapter(): Promise<Ulid> {
  const groupId = getCanonicalDbUlid()
  await client.query(
    `INSERT INTO nths_groups (id, name, key, invite_code)
     VALUES ($1, $2, $3, $4)`,
    [groupId, `Chapter ${groupId}`, `key-${groupId}`, groupId.slice(-6)]
  )
  return groupId
}

describe('NTHS checklist progress', () => {
  test('inserts progress only when the group and item have no saved status', async () => {
    const nthsGroupId = await createChapter()
    const firstUser = await createTestUser(client)
    const secondUser = await createTestUser(client)

    const inserted = await insertNTHSChecklistItemProgressIfMissing({
      nthsGroupId,
      itemKey: 'complete-orientation',
      status: 'incomplete',
      updatedByUserId: firstUser.id,
    })
    const ignored = await insertNTHSChecklistItemProgressIfMissing({
      nthsGroupId,
      itemKey: 'complete-orientation',
      status: 'complete',
      updatedByUserId: secondUser.id,
    })

    expect(inserted).toMatchObject({
      nthsGroupId,
      itemKey: 'complete-orientation',
      status: 'incomplete',
      updatedByUserId: firstUser.id,
    })
    expect(ignored).toBeUndefined()
    await expect(
      getNTHSChecklistProgressByGroupId(nthsGroupId)
    ).resolves.toEqual([inserted])
  })

  test('stores an explicit incomplete status', async () => {
    const nthsGroupId = await createChapter()
    const user = await createTestUser(client)

    const progress = await upsertNTHSChecklistItemProgress({
      nthsGroupId,
      itemKey: 'recruit-members',
      status: 'incomplete',
      updatedByUserId: user.id,
    })

    expect(progress).toMatchObject({
      nthsGroupId,
      itemKey: 'recruit-members',
      status: 'incomplete',
      updatedByUserId: user.id,
    })
    await expect(
      getNTHSChecklistProgressByGroupId(nthsGroupId)
    ).resolves.toEqual([progress])
  })

  test('updates an existing item status and updater', async () => {
    const nthsGroupId = await createChapter()
    const firstUser = await createTestUser(client)
    const secondUser = await createTestUser(client)
    const original = await upsertNTHSChecklistItemProgress({
      nthsGroupId,
      itemKey: 'recruit-members',
      status: 'complete',
      updatedByUserId: firstUser.id,
    })
    const staleUpdatedAt = new Date(original.updatedAt.getTime() - 60_000)
    await client.query(
      `UPDATE nths_group_checklist_item_progress
       SET updated_at = $2
       WHERE id = $1`,
      [original.id, staleUpdatedAt]
    )

    const updated = await upsertNTHSChecklistItemProgress({
      nthsGroupId,
      itemKey: 'recruit-members',
      status: 'skipped',
      updatedByUserId: secondUser.id,
    })

    expect(updated).toMatchObject({
      id: original.id,
      nthsGroupId,
      itemKey: 'recruit-members',
      status: 'skipped',
      updatedByUserId: secondUser.id,
      createdAt: original.createdAt,
    })
    expect(updated.updatedAt.getTime()).toBeGreaterThan(
      staleUpdatedAt.getTime()
    )
  })

  test('keeps progress isolated by chapter', async () => {
    const firstGroupId = await createChapter()
    const secondGroupId = await createChapter()
    const user = await createTestUser(client)
    await upsertNTHSChecklistItemProgress({
      nthsGroupId: firstGroupId,
      itemKey: 'recruit-members',
      status: 'complete',
      updatedByUserId: user.id,
    })
    await upsertNTHSChecklistItemProgress({
      nthsGroupId: secondGroupId,
      itemKey: 'recruit-members',
      status: 'incomplete',
      updatedByUserId: user.id,
    })

    const firstGroupProgress =
      await getNTHSChecklistProgressByGroupId(firstGroupId)
    const secondGroupProgress =
      await getNTHSChecklistProgressByGroupId(secondGroupId)

    expect(firstGroupProgress.map(({ status }) => status)).toEqual(['complete'])
    expect(secondGroupProgress.map(({ status }) => status)).toEqual([
      'incomplete',
    ])
  })
})
