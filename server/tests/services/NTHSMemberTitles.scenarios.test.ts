import * as NTHSGroupsRepo from '../../models/NTHSGroups'
import * as VolunteerRepo from '../../models/Volunteer'
import * as NTHSService from '../../services/NTHSGroupsService'
import * as db from '../../db'
import { getUuid } from '../../models/pgUtils'
import { InputError } from '../../models/Errors'
import type { NTHSGroupMemberWithRole } from '../../models/NTHSGroups'
import { NTHS_TITLES, NTHSTitle } from '../../constants/nths-titles'
import { buildNTHSGroupMemberWithRole } from '../mocks/generate'

jest.mock('../../models/NTHSGroups')
jest.mock('../../db')
jest.mock('../../models/Volunteer')
jest.mock('../../services/MailService')
jest.mock('../../logger')

const mockedNTHSRepo = jest.mocked(NTHSGroupsRepo)
const mockedVolunteerRepo = jest.mocked(VolunteerRepo)

const groupId = getUuid()

beforeEach(() => {
  jest.resetAllMocks()
  jest
    .mocked(db.runInTransaction)
    .mockImplementation(async (callback) => callback())
})

function inChapter(...members: NTHSGroupMemberWithRole[]) {
  mockedNTHSRepo.getGroupMembers.mockResolvedValue(members)
  mockedNTHSRepo.getActiveNthsGroupMember.mockImplementation(
    async (userId: string) => {
      const member = members.find(
        (m) => m.userId === userId && !m.deactivatedAt && !m.deleted
      )
      return member && { ...member, updatedAt: new Date() }
    }
  )
}

const admin = (title: NTHSTitle, overrides = {}) =>
  buildNTHSGroupMemberWithRole({
    nthsGroupId: groupId,
    roleName: 'admin',
    title,
    ...overrides,
  })
const plainMember = (title: NTHSTitle, overrides = {}) =>
  buildNTHSGroupMemberWithRole({
    nthsGroupId: groupId,
    roleName: 'member',
    title,
    ...overrides,
  })

function titleWritesFor(userId: string): string[] {
  return mockedNTHSRepo.updateNthsGroupMemberTitle.mock.calls
    .filter(([write]) => write.userId === userId)
    .map(([write]) => write.title)
}

function storedTitleAfter(member: NTHSGroupMemberWithRole): string {
  return titleWritesFor(member.userId).at(-1) ?? member.title
}

function expectNothingWritten() {
  expect(mockedNTHSRepo.upsertNthsGroupMemberRole).not.toHaveBeenCalled()
  expect(mockedNTHSRepo.deactivateGroupMember).not.toHaveBeenCalled()
}

describe('removing an admin role', () => {
  it.each([
    [
      'a co-president, sent with the title Member',
      'Member',
      'President',
      { role: 'member', title: 'Member' },
    ],
    ['a Vice President', 'Member', 'Vice President', { role: 'member' }],
    [
      'an Executive Board Member',
      'Executive Board Member',
      'Executive Board Member',
      { role: 'member' },
    ],
    [
      'a president, sent without a title',
      'Member',
      'President',
      { role: 'member' },
    ],
  ] as const)(
    'from %s leaves them titled %s',
    async (_label, expected, title, update) => {
      const target = admin(title)
      const otherPresident = admin('President')
      const bystander = plainMember('Executive Board Member')
      inChapter(target, otherPresident, bystander)

      await NTHSService.updateGroupMember(target.userId, groupId, update)

      expect(mockedNTHSRepo.upsertNthsGroupMemberRole).toHaveBeenCalledWith(
        { userId: target.userId, nthsGroupId: groupId, roleName: 'member' },
        undefined
      )
      expect(storedTitleAfter(target)).toBe(expected)
      expect(titleWritesFor(otherPresident.userId)).toEqual([])
      expect(titleWritesFor(bystander.userId)).toEqual([])
    }
  )
})

it.each(NTHS_TITLES.filter((title) => title !== 'Member'))(
  'making a member an admin writes the chosen title %s with the role',
  async (title) => {
    const target = plainMember('Member')
    const president = admin('President')
    inChapter(president, target)

    await NTHSService.updateGroupMember(target.userId, groupId, {
      role: 'admin',
      title,
    })

    expect(mockedNTHSRepo.upsertNthsGroupMemberRole).toHaveBeenCalledWith(
      { userId: target.userId, nthsGroupId: groupId, roleName: 'admin' },
      undefined
    )
    expect(storedTitleAfter(target)).toBe(title)
  }
)

it.each([
  [
    'the presidency to a plain member',
    plainMember('Member'),
    { title: 'President' },
  ],
  [
    'the presidency alongside a member role',
    plainMember('Member'),
    { role: 'member', title: 'President' },
  ],
  [
    'Vice President to an admin being demoted',
    admin('Member'),
    { role: 'member', title: 'Vice President' },
  ],
] as const)('refuses giving %s', async (_label, target, update) => {
  const president = admin('President')
  inChapter(president, target)

  await expect(
    NTHSService.updateGroupMember(target.userId, groupId, update)
  ).rejects.toThrow(InputError)
  expectNothingWritten()
  expect(titleWritesFor(target.userId)).toEqual([])
})

it('gives a plain member Executive Board Member without making them an admin', async () => {
  const target = plainMember('Member')
  const president = admin('President')
  inChapter(president, target)

  await NTHSService.updateGroupMember(target.userId, groupId, {
    title: 'Executive Board Member',
  })

  expect(storedTitleAfter(target)).toBe('Executive Board Member')
  expect(mockedNTHSRepo.upsertNthsGroupMemberRole).not.toHaveBeenCalledWith(
    expect.objectContaining({ roleName: 'admin' }),
    undefined
  )
})

it('lets an admin put themselves in the presidency beside a current president, rewriting nobody else', async () => {
  const president = admin('President')
  const self = admin('Member')
  inChapter(president, self)

  await NTHSService.updateGroupMember(self.userId, groupId, {
    title: 'President',
  })

  expect(storedTitleAfter(self)).toBe('President')
  expect(titleWritesFor(president.userId)).toEqual([])
})

it.each([
  ['a member who has left', { deactivatedAt: new Date('2026-09-01') }],
  ['a deleted account', { deleted: true }],
])('refuses to set a title on %s', async (_label, overrides) => {
  const target = plainMember('Member', overrides)
  const president = admin('President')
  inChapter(president, target)

  await expect(
    NTHSService.updateGroupMember(target.userId, groupId, {
      title: 'Executive Board Member',
    })
  ).rejects.toThrow(InputError)
  expect(titleWritesFor(target.userId)).toEqual([])
})

it('joins a member by invite with no title', async () => {
  const userId = getUuid()
  mockedVolunteerRepo.getVolunteerOccupations.mockResolvedValue([])

  await NTHSService.joinGroupAsMemberByGroupId(userId, groupId)

  expect(mockedNTHSRepo.joinGroupById).toHaveBeenCalledWith(
    { userId, groupId, title: 'Member' },
    undefined
  )
})
