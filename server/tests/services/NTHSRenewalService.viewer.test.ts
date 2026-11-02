import * as FeatureFlagService from '../../services/FeatureFlagService'
import * as NTHSRenewalDatesService from '../../services/NTHSRenewalDatesService'
import * as UserRepo from '../../models/User'
import * as NTHSRenewalRepo from '../../models/NTHSRenewal'
import type { NTHSRenewalState } from '../../models/NTHSRenewal'
import * as VolunteerRepo from '../../models/Volunteer'
import { VolunteerOccupations } from '../../models/Volunteer'
import { getRenewalsForViewer } from '../../services/NTHSRenewalService'
import { USER_BAN_TYPES } from '../../constants'
import { getDbUlid } from '../../models/pgUtils'
import { buildNTHSGroupWithMemberInfo } from '../mocks/generate'

jest.mock('../../db')
jest.mock('../../models/NTHSRenewal')
jest.mock('../../models/Volunteer')
jest.mock('../../models/User')
jest.mock('../../services/NTHSRenewalDatesService')

const mockedFlags = jest.mocked(FeatureFlagService)
const mockedDatesService = jest.mocked(NTHSRenewalDatesService)
const mockedUserRepo = jest.mocked(UserRepo)
const mockedRenewalRepo = jest.mocked(NTHSRenewalRepo)
const mockedVolunteerRepo = jest.mocked(VolunteerRepo)

const DATES = {
  nominationsOpen: '05-01',
  adminReminder: '06-01',
  successorConfirmation: '08-01',
  memberStage: '09-15',
  closeDate: '09-30',
}
const userId = getDbUlid()
const inMay = new Date('2027-05-03T15:00:00Z')
const inLateSeptember = new Date('2027-09-20T15:00:00Z')

function mockViewer(
  banType?: USER_BAN_TYPES,
  isOnboarded = true,
  hasVolunteerProfile = true,
  chapter: Partial<NTHSRenewalState> = {}
) {
  mockedVolunteerRepo.getVolunteersReadyToCoachStatus.mockResolvedValue(
    hasVolunteerProfile ? [{ id: userId, isOnboarded, isApproved: true }] : []
  )
  mockedUserRepo.getUsersBanStatuses.mockResolvedValue([
    { id: userId, banType: banType ?? null },
  ])
  mockedVolunteerRepo.getVolunteerOccupations.mockResolvedValue([
    VolunteerOccupations.HIGH_SCHOOL_STUDENT,
  ])
  mockedRenewalRepo.getNthsRenewalState.mockResolvedValue({
    createdAt: new Date('2026-02-10T15:00:00Z'),
    closedAt: null,
    hasConfirmedPresident: false,
    hasNamedSuccessor: false,
    viewerCandidacy: 'none',
    viewerNamedSelf: false,
    hasManager: true,
    ...chapter,
  })
}

function successor(
  firstName: string,
  lastInitial: string,
  accepted: boolean | null
) {
  return {
    userId: getDbUlid(),
    firstName,
    lastInitial,
    accepted,
    namedBy: null,
  }
}

const president = buildNTHSGroupWithMemberInfo({
  memberInfo: { title: 'President', joinedAt: new Date(), roleName: 'admin' },
})

describe('getRenewalsForViewer', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockedFlags.isNthsChapterRenewalEnabled.mockResolvedValue(true)
  })

  it('shows no renewal prompt while the renewal flag is off', async () => {
    mockedFlags.isNthsChapterRenewalEnabled.mockResolvedValue(false)
    mockedDatesService.getNthsChapterRenewalDates.mockResolvedValue(DATES)
    mockViewer()

    await expect(
      getRenewalsForViewer(userId, [president], inMay)
    ).resolves.toEqual([
      {
        prompt: 'none',
        closesOn: null,
        successorConfirmationOn: null,
        namingClosesOn: null,
        commitmentsRequired: false,
        canNameSelf: false,
        namingSelfAccepts: false,
        namedSelf: false,
        memberStageOpen: false,
        acceptedPresidents: [],
      },
    ])
  })

  it('offers step-up in place of the member prompt while the renewal flag is off', async () => {
    mockedFlags.isNthsChapterRenewalEnabled.mockResolvedValue(false)
    mockedDatesService.getNthsChapterRenewalDates.mockResolvedValue(DATES)
    mockViewer(undefined, true, true, { hasManager: false })
    const member = buildNTHSGroupWithMemberInfo({
      memberInfo: { joinedAt: new Date(), roleName: 'member' },
    })

    const [renewal] = await getRenewalsForViewer(
      userId,
      [member],
      inLateSeptember
    )

    expect(renewal.prompt).toBe('step-up')
  })

  it('reads nothing from the database when the flag is on but the dates are null', async () => {
    mockedDatesService.getNthsChapterRenewalDates.mockResolvedValue(null)

    const [renewal] = await getRenewalsForViewer(userId, [president], inMay)

    expect(renewal.prompt).toBe('none')
    expect(mockedRenewalRepo.getNthsRenewalState).not.toHaveBeenCalled()
  })

  it('reads the state for the cycle the dates point at', async () => {
    mockedDatesService.getNthsChapterRenewalDates.mockResolvedValue(DATES)
    mockViewer()

    const [renewal] = await getRenewalsForViewer(userId, [president], inMay)

    expect(mockedRenewalRepo.getNthsRenewalState).toHaveBeenCalledWith(
      president.groupInfo.id,
      userId,
      '2027-07-01'
    )
    expect(renewal).toMatchObject({
      closesOn: '2027-09-30',
      successorConfirmationOn: '2027-08-01',
      namingClosesOn: '2027-09-14',
    })
  })

  it('shows no prompt for a chapter with no renewal state', async () => {
    mockedDatesService.getNthsChapterRenewalDates.mockResolvedValue(DATES)
    mockViewer()
    mockedRenewalRepo.getNthsRenewalState.mockResolvedValue(undefined)

    const [renewal] = await getRenewalsForViewer(userId, [president], inMay)

    expect(renewal).toMatchObject({
      prompt: 'none',
      closesOn: null,
      successorConfirmationOn: null,
      namingClosesOn: null,
    })
  })

  it.each([
    [
      'co-president-offer',
      { hasConfirmedPresident: true, viewerNamedSelf: false },
      [{ firstName: 'Ada', lastInitial: 'L' }],
      1,
    ],
    [
      'successor-must-answer',
      { hasConfirmedPresident: false, viewerNamedSelf: true },
      [],
      0,
    ],
  ])(
    'reads the accepted presidents only on the %s prompt',
    async (prompt, chapter, expected, successorReads) => {
      mockedDatesService.getNthsChapterRenewalDates.mockResolvedValue(DATES)
      mockViewer(undefined, true, true, {
        ...chapter,
        hasNamedSuccessor: true,
        viewerCandidacy: 'named',
      })
      mockedRenewalRepo.getRenewalSuccessors.mockResolvedValue([
        successor('Ada', 'L', true),
        successor('Bo', 'K', null),
        successor('Cy', 'M', false),
      ])
      const inAugust = new Date('2027-08-10T15:00:00Z')

      const [renewal] = await getRenewalsForViewer(
        userId,
        [president],
        inAugust
      )

      expect(renewal).toMatchObject({
        prompt,
        namedSelf: chapter.viewerNamedSelf,
        memberStageOpen: false,
      })
      expect(renewal.acceptedPresidents).toEqual(expected)
      expect(mockedRenewalRepo.getRenewalSuccessors).toHaveBeenCalledTimes(
        successorReads
      )
    }
  )

  it('treats an admin with a live media ban as banned', async () => {
    mockedDatesService.getNthsChapterRenewalDates.mockResolvedValue(DATES)
    mockViewer(USER_BAN_TYPES.LIVE_MEDIA)

    const [renewal] = await getRenewalsForViewer(userId, [president], inMay)

    expect(renewal.prompt).toBe('none')
  })

  it('treats a banned member with no volunteer profile as banned', async () => {
    mockedDatesService.getNthsChapterRenewalDates.mockResolvedValue(DATES)
    mockViewer(USER_BAN_TYPES.COMPLETE, true, false)

    const [renewal] = await getRenewalsForViewer(userId, [president], inMay)

    expect(renewal.prompt).toBe('none')
  })

  it.each([
    ['chapter admin', president, inMay, 'name-successor-banner', false],
    [
      'plain member',
      buildNTHSGroupWithMemberInfo({
        memberInfo: { joinedAt: new Date(), roleName: 'member' },
      }),
      inLateSeptember,
      'member-not-cleared',
      true,
    ],
  ])(
    'decides clearance by role for a %s not ready to coach',
    async (_role, group, now, prompt, commitmentsRequired) => {
      mockedDatesService.getNthsChapterRenewalDates.mockResolvedValue(DATES)
      mockViewer(undefined, false)

      const [renewal] = await getRenewalsForViewer(userId, [group], now)

      expect(renewal).toMatchObject({ prompt, commitmentsRequired })
    }
  )
})
