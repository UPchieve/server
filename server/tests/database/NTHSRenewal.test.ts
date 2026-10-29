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
const NAMED_AT = '2027-05-03T15:00:00.000Z'

type CandidateOptions = {
  namedAt?: string | null
  accepted?: boolean | null
  schoolYear?: string
}

async function addCandidate(
  groupId: Ulid,
  userId: Ulid,
  options: CandidateOptions = {}
): Promise<void> {
  const accepted = options.accepted ?? null
  await client.query(
    `INSERT INTO nths_group_renewal_candidates
       (nths_group_id, school_year_starts_on, user_id, named_at, accepted, responded_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      groupId,
      options.schoolYear ?? SCHOOL_YEAR,
      userId,
      options.namedAt === undefined ? NAMED_AT : options.namedAt,
      accepted,
      accepted === null ? null : NAMED_AT,
    ]
  )
}

async function stateFor(groupId: Ulid, viewerId: Ulid) {
  return getNthsRenewalState(groupId, viewerId, SCHOOL_YEAR, client)
}

describe('getNthsRenewalState', () => {
  it('returns the chapter dates and nothing named for a fresh chapter', async () => {
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
      hasNamedSuccessor: false,
      viewerCandidacy: 'none',
    })
  })

  it('returns undefined for an unknown chapter', async () => {
    await expect(stateFor(getDbUlid(), getDbUlid())).resolves.toBeUndefined()
  })

  it.each<[string, CandidateOptions, string]>([
    ['named and unanswered', { accepted: null }, 'named'],
    ['accepted', { accepted: true }, 'accepted'],
    ['declined after being named', { accepted: false }, 'declined'],
    [
      'declined at the member stage',
      { namedAt: null, accepted: false },
      'declined',
    ],
    [
      'named for another school year',
      { schoolYear: OTHER_SCHOOL_YEAR },
      'none',
    ],
  ])('maps a viewer %s', async (_label, options, candidacy) => {
    const groupId = await createChapter(client)
    const viewerId = await createChapterMember(client, groupId)
    await addCandidate(groupId, viewerId, options)

    expect((await stateFor(groupId, viewerId))?.viewerCandidacy).toBe(candidacy)
  })

  it.each<[string, ChapterMemberOptions, CandidateOptions, boolean, boolean]>([
    ['a current member accepted', {}, { accepted: true }, true, true],
    [
      'a deactivated member accepted',
      { deactivatedAt: '2027-08-01T00:00:00.000Z' },
      { accepted: true },
      false,
      false,
    ],
    [
      'a deleted member accepted',
      { deleted: true },
      { accepted: true },
      false,
      false,
    ],
    ['a current member is named', {}, {}, false, true],
    [
      'a deactivated member is named',
      { deactivatedAt: '2027-08-01T00:00:00.000Z' },
      {},
      false,
      false,
    ],
    ['a deleted member is named', { deleted: true }, {}, false, false],
    ['a named member declined', {}, { accepted: false }, false, false],
    [
      'a member accepted for another school year',
      {},
      { accepted: true, schoolYear: OTHER_SCHOOL_YEAR },
      false,
      false,
    ],
  ])(
    'counts the chapter state when %s',
    async (
      _label,
      memberOptions,
      candidateOptions,
      hasConfirmedPresident,
      hasNamedSuccessor
    ) => {
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
        hasNamedSuccessor,
        viewerCandidacy: 'none',
      })
    }
  )

  it('ignores another chapter’s candidates', async () => {
    const groupId = await createChapter(client)
    const otherGroupId = await createChapter(client)
    const viewerId = await createChapterMember(client, groupId)
    const otherCandidate = await createChapterMember(client, otherGroupId)
    await addCandidate(otherGroupId, otherCandidate, { accepted: true })

    await expect(stateFor(groupId, viewerId)).resolves.toMatchObject({
      hasConfirmedPresident: false,
      hasNamedSuccessor: false,
    })
  })
})
