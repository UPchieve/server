/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import { getDbUlid, Ulid } from '../../models/pgUtils'
import { getNthsRenewalState } from '../../models/NTHSRenewal'
import {
  ChapterMemberOptions,
  createChapter,
  createChapterMember,
} from './seed-utils'

const client = getClient()

const SCHOOL_YEAR = '2027-07-01'
const OTHER_SCHOOL_YEAR = '2026-07-01'
const CREATED_AT = '2027-08-03T15:00:00.000Z'

type CandidateOptions = {
  schoolYear?: string
}

// Raw insert: answers through the service need a whole renewal cycle set up.
async function addCandidate(
  groupId: Ulid,
  userId: Ulid,
  options: CandidateOptions = {}
): Promise<void> {
  await client.query(
    `INSERT INTO nths_group_renewal_candidates
       (nths_group_id, school_year_starts_on, user_id, created_at)
     VALUES ($1, $2, $3, $4)`,
    [groupId, options.schoolYear ?? SCHOOL_YEAR, userId, CREATED_AT]
  )
}

async function stateFor(groupId: Ulid, viewerId: Ulid) {
  return getNthsRenewalState(groupId, viewerId, SCHOOL_YEAR, client)
}

describe('getNthsRenewalState', () => {
  it('returns the chapter dates and no answers for a fresh chapter', async () => {
    const closedAt = '2027-03-01T00:00:00.000Z'
    const groupId = await createChapter(client, closedAt)
    const viewerId = await createChapterMember(client, groupId)
    const { rows } = await client.query(
      `UPDATE nths_groups SET created_at = $2 WHERE id = $1 RETURNING created_at`,
      [groupId, '2026-01-02T03:04:05.000Z']
    )

    const state = await stateFor(groupId, viewerId)

    expect(state?.createdAt).toEqual(rows[0].created_at)
    expect(state?.closedAt?.toISOString()).toBe(closedAt)
    expect(state).toMatchObject({
      hasConfirmedPresident: false,
      viewerCandidacy: 'none',
    })
  })

  it('returns undefined for an unknown chapter', async () => {
    await expect(stateFor(getDbUlid(), getDbUlid())).resolves.toBeUndefined()
  })

  it.each<[string, CandidateOptions, string]>([
    ['accepted', {}, 'accepted'],
    [
      'accepted for another school year',
      { schoolYear: OTHER_SCHOOL_YEAR },
      'none',
    ],
  ])('maps a viewer %s', async (_label, options, candidacy) => {
    const groupId = await createChapter(client)
    const viewerId = await createChapterMember(client, groupId)
    await addCandidate(groupId, viewerId, options)

    expect((await stateFor(groupId, viewerId))?.viewerCandidacy).toBe(candidacy)
  })

  it.each<[string, ChapterMemberOptions, CandidateOptions, boolean]>([
    ['a current member accepted', {}, {}, true],
    [
      'a deactivated member accepted',
      { deactivatedAt: '2027-08-01T00:00:00.000Z' },
      {},
      false,
    ],
    ['a deleted member accepted', { deleted: true }, {}, false],
    [
      'a member accepted for another school year',
      {},
      { schoolYear: OTHER_SCHOOL_YEAR },
      false,
    ],
  ])(
    'counts the chapter state when %s',
    async (_label, memberOptions, candidateOptions, hasConfirmedPresident) => {
      const groupId = await createChapter(client)
      const viewerId = await createChapterMember(client, groupId)
      const candidateId = await createChapterMember(
        client,
        groupId,
        memberOptions
      )
      await addCandidate(groupId, candidateId, candidateOptions)

      await expect(stateFor(groupId, viewerId)).resolves.toMatchObject({
        hasConfirmedPresident,
        viewerCandidacy: 'none',
      })
    }
  )

  it('ignores another chapter’s candidates', async () => {
    const groupId = await createChapter(client)
    const otherGroupId = await createChapter(client)
    const viewerId = await createChapterMember(client, groupId)
    const otherCandidate = await createChapterMember(client, otherGroupId)
    await addCandidate(otherGroupId, otherCandidate)

    await expect(stateFor(groupId, viewerId)).resolves.toMatchObject({
      hasConfirmedPresident: false,
    })
  })
})
