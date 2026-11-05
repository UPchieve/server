import {
  closeRenewalCycle,
  nextRenewalCycle,
  renewalPromptFor,
  type RenewalPromptInput,
} from '../../services/NTHSRenewalService'

const DATES = {
  nominationsOpen: '05-01',
  successorConfirmation: '08-01',
  memberStage: '09-15',
  closeDate: '09-30',
}

type Overrides = {
  dates?: RenewalPromptInput['dates']
  chapter?: Partial<RenewalPromptInput['chapter']>
  viewer?: Partial<RenewalPromptInput['viewer']>
}

function input(now: string, overrides: Overrides = {}): RenewalPromptInput {
  return {
    dates: overrides.dates === undefined ? DATES : overrides.dates,
    now: new Date(now),
    chapter: {
      createdAt: new Date('2027-02-10T15:00:00Z'),
      closedAt: null,
      hasConfirmedPresident: false,
      hasManager: true,
      ...overrides.chapter,
    },
    viewer: {
      isAdmin: false,
      isPresident: false,
      isCleared: true,
      ...overrides.viewer,
    },
  }
}

const admin = { isAdmin: true }
const president = { isAdmin: true, isPresident: true }
const uncleared = { isCleared: false }
const confirmed = { hasConfirmedPresident: true }
const unmanaged = { hasManager: false }

describe('renewalPromptFor', () => {
  it.each<[string, string, Overrides, string, string | null]>([
    [
      'flag off',
      '2027-05-03T15:00:00Z',
      { dates: null, viewer: admin },
      'none',
      null,
    ],
    [
      'admin before handoff opens',
      '2027-05-01T11:59:00Z',
      { viewer: admin },
      'none',
      '2027-09-30',
    ],
    [
      'admin when handoff opens at noon UTC',
      '2027-05-01T12:00:00Z',
      { viewer: admin },
      'handoff-banner',
      '2027-09-30',
    ],
    [
      'President just before confirmation opens',
      '2027-08-01T11:59:00Z',
      { viewer: president },
      'handoff-banner',
      '2027-09-30',
    ],
    [
      'uncleared admin in May',
      '2027-05-03T15:00:00Z',
      { viewer: { ...admin, ...uncleared } },
      'none',
      '2027-09-30',
    ],
    ['plain member in May', '2027-05-03T15:00:00Z', {}, 'none', '2027-09-30'],
    [
      'member of an unmanaged chapter in July',
      '2027-07-20T15:00:00Z',
      { chapter: unmanaged },
      'none',
      '2027-09-30',
    ],
    [
      'President when confirmation opens',
      '2027-08-01T12:00:00Z',
      { viewer: president },
      'confirm-return',
      '2027-09-30',
    ],
    [
      'admin without the President title in August',
      '2027-08-10T15:00:00Z',
      { viewer: admin },
      'confirm-reminder',
      '2027-09-30',
    ],
    [
      'uncleared President in August',
      '2027-08-10T15:00:00Z',
      { viewer: { ...president, ...uncleared } },
      'president-not-cleared',
      '2027-09-30',
    ],
    [
      'uncleared admin without the President title in August',
      '2027-08-10T15:00:00Z',
      { viewer: { ...admin, ...uncleared } },
      'none',
      '2027-09-30',
    ],
    [
      'plain member in August',
      '2027-08-10T15:00:00Z',
      {},
      'none',
      '2027-09-30',
    ],
    [
      'the confirmed president',
      '2027-08-20T15:00:00Z',
      { viewer: president, chapter: confirmed },
      'none',
      '2027-09-30',
    ],
    [
      'member of a confirmed chapter in the member stage',
      '2027-09-16T15:00:00Z',
      { chapter: confirmed },
      'none',
      '2027-09-30',
    ],
    [
      'member of a confirmed unmanaged chapter in August',
      '2027-08-10T15:00:00Z',
      { chapter: { ...confirmed, ...unmanaged } },
      'none',
      '2027-09-30',
    ],
    [
      'plain member when the member stage opens',
      '2027-09-15T12:00:00Z',
      {},
      'member-countdown',
      '2027-09-30',
    ],
    [
      'President at the member stage',
      '2027-09-16T15:00:00Z',
      { viewer: president },
      'member-countdown',
      '2027-09-30',
    ],
    [
      'admin at the member stage',
      '2027-09-16T15:00:00Z',
      { viewer: admin },
      'member-countdown',
      '2027-09-30',
    ],
    [
      'uncleared President at the member stage',
      '2027-09-16T15:00:00Z',
      { viewer: { ...president, ...uncleared } },
      'member-not-cleared',
      '2027-09-30',
    ],
    [
      'uncleared plain member at the member stage',
      '2027-09-16T15:00:00Z',
      { viewer: uncleared },
      'member-not-cleared',
      '2027-09-30',
    ],
    [
      'member of an unmanaged chapter when confirmation opens',
      '2027-08-01T12:00:00Z',
      { chapter: unmanaged },
      'member-countdown',
      '2027-09-30',
    ],
    [
      'uncleared member of an unmanaged chapter in August',
      '2027-08-10T15:00:00Z',
      { viewer: uncleared, chapter: unmanaged },
      'member-not-cleared',
      '2027-09-30',
    ],
    [
      'closed chapter',
      '2027-05-03T15:00:00Z',
      {
        viewer: admin,
        chapter: { closedAt: new Date('2027-03-01T00:00:00Z') },
      },
      'none',
      null,
    ],
    [
      'chapter founded at the start of the school year renewed for',
      '2027-09-16T15:00:00Z',
      { chapter: { createdAt: new Date('2027-07-01T00:00:00Z') } },
      'none',
      null,
    ],
    [
      'chapter founded just before the school year renewed for',
      '2027-06-10T15:00:00Z',
      {
        viewer: admin,
        chapter: { createdAt: new Date('2027-06-30T23:59:00Z') },
      },
      'handoff-banner',
      '2027-09-30',
    ],
    [
      'renewal turned on in Oct 2026 points at the 2027 cycle',
      '2026-10-22T15:00:00Z',
      {
        viewer: admin,
        chapter: { createdAt: new Date('2026-02-10T15:00:00Z') },
      },
      'none',
      '2027-09-30',
    ],
    [
      'member at the close instant moves to the next cycle',
      '2027-10-01T12:00:00Z',
      {},
      'none',
      '2028-09-30',
    ],
  ])('%s', (_label, now, overrides, prompt, closesOn) => {
    expect(renewalPromptFor(input(now, overrides))).toMatchObject({
      prompt,
      closesOn,
    })
  })

  describe('moved dates', () => {
    const movedMemberStage = {
      ...DATES,
      memberStage: '09-22',
      closeDate: '10-15',
    }

    it.each<[string, string, Overrides, string, string | null]>([
      [
        'plain member before the moved member stage',
        '2027-09-16T15:00:00Z',
        { dates: movedMemberStage },
        'none',
        '2027-10-15',
      ],
      [
        'President before the moved member stage',
        '2027-09-16T15:00:00Z',
        { dates: movedMemberStage, viewer: president },
        'confirm-return',
        '2027-10-15',
      ],
      [
        'plain member at the moved member stage',
        '2027-09-22T12:00:00Z',
        { dates: movedMemberStage },
        'member-countdown',
        '2027-10-15',
      ],
      [
        'close date moved behind now',
        '2027-09-25T14:00:00Z',
        { dates: { ...DATES, closeDate: '09-24' } },
        'none',
        '2028-09-24',
      ],
      [
        'close date on Dec 31, on Jan 1 before the close instant',
        '2028-01-01T05:00:00Z',
        {
          dates: {
            nominationsOpen: '01-15',
            successorConfirmation: '03-01',
            memberStage: '04-01',
            closeDate: '12-31',
          },
        },
        'member-countdown',
        '2027-12-31',
      ],
    ])('%s', (_label, now, overrides, prompt, closesOn) => {
      expect(renewalPromptFor(input(now, overrides))).toMatchObject({
        prompt,
        closesOn,
      })
    })
  })

  it.each<[string, string, Overrides, string | null]>([
    ['renewing chapter', '2027-05-03T15:00:00Z', {}, '2027-08-01'],
    [
      'after the close instant, the next cycle',
      '2027-10-01T12:00:00Z',
      {},
      '2028-08-01',
    ],
    [
      'closed chapter',
      '2027-05-03T15:00:00Z',
      { chapter: { closedAt: new Date('2027-03-01T00:00:00Z') } },
      null,
    ],
    ['flag off', '2027-05-03T15:00:00Z', { dates: null }, null],
  ])(
    'the date confirmation opens: %s',
    (_label, now, overrides, successorConfirmationOn) => {
      expect(
        renewalPromptFor(input(now, overrides)).successorConfirmationOn
      ).toBe(successorConfirmationOn)
    }
  )
})

describe('renewal cycle windows', () => {
  const at = (iso: string) => new Date(iso)

  it.each<[string, string, number | undefined]>([
    ['just before the close instant', '2026-10-01T11:59:59Z', undefined],
    ['at the close instant', '2026-10-01T12:00:00Z', 2026],
    ['just before the window ends', '2026-10-02T11:59:59Z', 2026],
    ['when the window ends', '2026-10-02T12:00:00Z', undefined],
  ])('closeRenewalCycle %s', (_label, now, year) => {
    expect(closeRenewalCycle(DATES, at(now))?.year).toBe(year)
  })

  it('finds the previous year cycle when the close date is Dec 31', () => {
    const dates = { ...DATES, closeDate: '12-31' }

    expect(closeRenewalCycle(dates, at('2027-01-01T13:00:00Z'))?.year).toBe(
      2026
    )
  })

  it('derives the member email end, window end and sent-since from the cycle', () => {
    expect(nextRenewalCycle(DATES, at('2026-09-20T12:00:00Z'))).toMatchObject({
      year: 2026,
      memberEmailEndsAt: at('2026-10-01T11:00:00Z'),
      closeWindowEndsAt: at('2026-10-02T12:00:00Z'),
      sentSince: at('2026-01-01T00:00:00Z'),
    })
  })
})
