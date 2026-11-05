import * as FeatureFlagService from '../../services/FeatureFlagService'
import * as NTHSRenewalDatesService from '../../services/NTHSRenewalDatesService'
import * as NTHSRenewalRepo from '../../models/NTHSRenewal'
import type { NTHSRenewalState } from '../../models/NTHSRenewal'
import * as VolunteerRepo from '../../models/Volunteer'
import { VolunteerOccupations } from '../../models/Volunteer'
import { getRenewalsForViewer } from '../../services/NTHSRenewalService'
import { getDbUlid } from '../../models/pgUtils'
import { buildNTHSGroupWithMemberInfo } from '../mocks/generate'

jest.mock('../../db')
jest.mock('../../models/NTHSRenewal')
jest.mock('../../models/Volunteer')
jest.mock('../../services/NTHSRenewalDatesService')

const mockedFlags = jest.mocked(FeatureFlagService)
const mockedDatesService = jest.mocked(NTHSRenewalDatesService)
const mockedRenewalRepo = jest.mocked(NTHSRenewalRepo)
const mockedVolunteerRepo = jest.mocked(VolunteerRepo)

const DATES = {
  nominationsOpen: '05-01',
  successorConfirmation: '08-01',
  memberStage: '09-15',
  closeDate: '09-30',
}
const userId = getDbUlid()
const inMay = new Date('2027-05-03T15:00:00Z')
const inLateSeptember = new Date('2027-09-20T15:00:00Z')

function mockViewer(
  isOnboarded = true,
  chapter: Partial<NTHSRenewalState> = {}
) {
  mockedVolunteerRepo.getVolunteersReadyToCoachStatus.mockResolvedValue([
    { id: userId, isOnboarded, isApproved: true },
  ])
  mockedVolunteerRepo.getVolunteerOccupations.mockResolvedValue([
    VolunteerOccupations.HIGH_SCHOOL_STUDENT,
  ])
  mockedRenewalRepo.getNthsRenewalState.mockResolvedValue({
    createdAt: new Date('2026-02-10T15:00:00Z'),
    closedAt: null,
    hasConfirmedPresident: false,
    viewerCandidacy: 'none',
    hasManager: true,
    ...chapter,
  })
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
      { prompt: 'none', closesOn: null, successorConfirmationOn: null },
    ])
  })

  it('offers step-up in place of the member prompt while the renewal flag is off', async () => {
    mockedFlags.isNthsChapterRenewalEnabled.mockResolvedValue(false)
    mockedDatesService.getNthsChapterRenewalDates.mockResolvedValue(DATES)
    mockViewer(true, { hasManager: false })
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
    expect(renewal).toEqual({
      prompt: 'handoff-banner',
      closesOn: '2027-09-30',
      successorConfirmationOn: '2027-08-01',
    })
  })

  it('shows no prompt for a chapter with no renewal state', async () => {
    mockedDatesService.getNthsChapterRenewalDates.mockResolvedValue(DATES)
    mockViewer()
    mockedRenewalRepo.getNthsRenewalState.mockResolvedValue(undefined)

    const [renewal] = await getRenewalsForViewer(userId, [president], inMay)

    expect(renewal).toEqual({
      prompt: 'none',
      closesOn: null,
      successorConfirmationOn: null,
    })
  })

  it.each([
    ['President', 'confirm-return'],
    ['Vice President', 'confirm-reminder'],
  ])('gives an admin with the %s title %s in August', async (title, prompt) => {
    mockedDatesService.getNthsChapterRenewalDates.mockResolvedValue(DATES)
    mockViewer()
    const group = buildNTHSGroupWithMemberInfo({
      memberInfo: { title, joinedAt: new Date(), roleName: 'admin' },
    })

    const [renewal] = await getRenewalsForViewer(
      userId,
      [group],
      new Date('2027-08-10T15:00:00Z')
    )

    expect(renewal.prompt).toBe(prompt)
  })

  it.each([
    ['chapter admin', president, inMay, 'handoff-banner'],
    [
      'plain member',
      buildNTHSGroupWithMemberInfo({
        memberInfo: { joinedAt: new Date(), roleName: 'member' },
      }),
      inLateSeptember,
      'member-not-cleared',
    ],
  ])(
    'decides clearance by role for a %s not ready to coach',
    async (_role, group, now, prompt) => {
      mockedDatesService.getNthsChapterRenewalDates.mockResolvedValue(DATES)
      mockViewer(false)

      const [renewal] = await getRenewalsForViewer(userId, [group], now)

      expect(renewal.prompt).toBe(prompt)
    }
  )
})
