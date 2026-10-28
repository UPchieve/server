import {
  renewalPromptFor,
  renewalControlsFor,
  type RenewalPromptInput,
} from '../../services/NTHSRenewalService'

const DATES = {
  nominationsOpen: '05-01',
  adminReminder: '06-01',
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
      hasNamedSuccessor: false,
      ...overrides.chapter,
    },
    viewer: {
      isAdmin: false,
      isCleared: true,
      isBanned: false,
      candidacy: 'none',
      ...overrides.viewer,
    },
  }
}

const admin = { isAdmin: true }
const named = { candidacy: 'named' } as const
const declined = { candidacy: 'declined' } as const
const accepted = { candidacy: 'accepted' } as const
const someoneNamed = { hasNamedSuccessor: true }
const confirmed = { hasConfirmedPresident: true, hasNamedSuccessor: true }

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
      'admin before nominations open',
      '2027-05-01T11:59:00Z',
      { viewer: admin },
      'none',
      '2027-09-30',
    ],
    [
      'admin when nominations open at noon UTC',
      '2027-05-01T12:00:00Z',
      { viewer: admin },
      'name-successor-banner',
      '2027-09-30',
    ],
    [
      'solo president in May, nobody named',
      '2027-05-03T15:00:00Z',
      { viewer: admin },
      'name-successor-banner',
      '2027-09-30',
    ],
    [
      'admin who named themselves in May',
      '2027-05-03T15:00:00Z',
      { viewer: { ...admin, ...named }, chapter: someoneNamed },
      'successors-named',
      '2027-09-30',
    ],
    ['plain member in May', '2027-05-03T15:00:00Z', {}, 'none', '2027-09-30'],
    [
      'admin in June, nobody named',
      '2027-06-03T15:00:00Z',
      { viewer: admin },
      'name-successor-reminder',
      '2027-09-30',
    ],
    [
      'admin just before the reminder date',
      '2027-06-01T11:59:00Z',
      { viewer: admin },
      'name-successor-banner',
      '2027-09-30',
    ],
    [
      'admin in June, someone named',
      '2027-06-20T15:00:00Z',
      { viewer: admin, chapter: someoneNamed },
      'successors-named',
      '2027-09-30',
    ],
    [
      'named plain member before the successor date',
      '2027-07-15T15:00:00Z',
      { viewer: named, chapter: someoneNamed },
      'none',
      '2027-09-30',
    ],
    [
      'named admin just before the successor date',
      '2027-08-01T11:59:00Z',
      { viewer: { ...admin, ...named }, chapter: someoneNamed },
      'successors-named',
      '2027-09-30',
    ],
    [
      'named successor at the successor date',
      '2027-08-01T12:00:00Z',
      { viewer: named, chapter: someoneNamed },
      'successor-must-answer',
      '2027-09-30',
    ],
    [
      'named admin after the successor date',
      '2027-08-03T15:00:00Z',
      { viewer: { ...admin, ...named }, chapter: someoneNamed },
      'successor-must-answer',
      '2027-09-30',
    ],
    [
      'named successor still unanswered in the member stage',
      '2027-09-16T15:00:00Z',
      { viewer: named, chapter: someoneNamed },
      'successor-must-answer',
      '2027-09-30',
    ],
    [
      'other named successor once the chapter is confirmed',
      '2027-08-20T15:00:00Z',
      { viewer: named, chapter: confirmed },
      'co-president-offer',
      '2027-09-30',
    ],
    [
      'other named successor just before the close instant',
      '2027-10-01T11:59:00Z',
      { viewer: named, chapter: confirmed },
      'co-president-offer',
      '2027-09-30',
    ],
    [
      'the confirmed president',
      '2027-08-20T15:00:00Z',
      { viewer: { ...admin, ...accepted }, chapter: confirmed },
      'none',
      '2027-09-30',
    ],
    [
      'another admin of a confirmed chapter',
      '2027-08-20T15:00:00Z',
      { viewer: admin, chapter: confirmed },
      'none',
      '2027-09-30',
    ],
    [
      'plain member of a confirmed chapter in the member stage',
      '2027-09-16T15:00:00Z',
      { chapter: confirmed },
      'none',
      '2027-09-30',
    ],
    [
      'member who stepped down in a confirmed chapter, in the member stage',
      '2027-09-16T15:00:00Z',
      { viewer: declined, chapter: confirmed },
      'none',
      '2027-09-30',
    ],
    [
      'uncleared named successor of a confirmed chapter',
      '2027-08-20T15:00:00Z',
      { viewer: { ...named, isCleared: false }, chapter: confirmed },
      'none',
      '2027-09-30',
    ],
    [
      'uncleared named successor',
      '2027-08-02T15:00:00Z',
      { viewer: { ...named, isCleared: false }, chapter: someoneNamed },
      'successor-not-cleared',
      '2027-09-30',
    ],
    [
      'uncleared named successor in the member stage',
      '2027-09-16T15:00:00Z',
      { viewer: { ...named, isCleared: false }, chapter: someoneNamed },
      'successor-not-cleared',
      '2027-09-30',
    ],
    [
      'member who stepped down, before the member stage',
      '2027-08-05T15:00:00Z',
      { viewer: declined },
      'none',
      '2027-09-30',
    ],
    [
      'member who stepped down, just before the member stage',
      '2027-09-15T11:59:00Z',
      { viewer: declined },
      'none',
      '2027-09-30',
    ],
    [
      'member who stepped down, at the member stage',
      '2027-09-15T12:00:00Z',
      { viewer: declined },
      'decliner-countdown',
      '2027-09-30',
    ],
    [
      'decliner after Sept 30 ended in their zone, before the close instant',
      '2027-10-01T05:00:00Z',
      { viewer: declined },
      'decliner-countdown',
      '2027-09-30',
    ],
    [
      'admin who stepped down, nobody named',
      '2027-08-09T15:00:00Z',
      { viewer: { ...admin, ...declined } },
      'name-successor-reminder',
      '2027-09-30',
    ],
    [
      'admin who stepped down, someone else named',
      '2027-08-09T15:00:00Z',
      { viewer: { ...admin, ...declined }, chapter: someoneNamed },
      'successors-named',
      '2027-09-30',
    ],
    [
      'plain member at the member stage',
      '2027-09-16T15:00:00Z',
      {},
      'member-must-answer',
      '2027-09-30',
    ],
    [
      'unnamed admin at the member stage, nobody named',
      '2027-09-16T15:00:00Z',
      { viewer: admin },
      'member-must-answer',
      '2027-09-30',
    ],
    [
      'unnamed admin at the member stage, someone named',
      '2027-09-16T15:00:00Z',
      { viewer: admin, chapter: someoneNamed },
      'member-must-answer',
      '2027-09-30',
    ],
    [
      'uncleared plain member at the member stage',
      '2027-09-16T15:00:00Z',
      { viewer: { isCleared: false } },
      'member-not-cleared',
      '2027-09-30',
    ],
    [
      'uncleared admin at the member stage',
      '2027-09-16T15:00:00Z',
      { viewer: { ...admin, isCleared: false } },
      'member-not-cleared',
      '2027-09-30',
    ],
    [
      'uncleared member who stepped down, at the member stage',
      '2027-09-16T15:00:00Z',
      { viewer: { ...declined, isCleared: false } },
      'member-not-cleared',
      '2027-09-30',
    ],
    [
      'uncleared admin in May, nobody named',
      '2027-05-03T15:00:00Z',
      { viewer: { ...admin, isCleared: false } },
      'none',
      '2027-09-30',
    ],
    [
      'uncleared admin in June, nobody named',
      '2027-06-03T15:00:00Z',
      { viewer: { ...admin, isCleared: false } },
      'none',
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
      'name-successor-reminder',
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
      'named successor at the close instant moves to the next cycle',
      '2027-10-01T12:00:00Z',
      { viewer: named, chapter: confirmed },
      'none',
      '2028-09-30',
    ],
  ])('%s', (_label, now, overrides, prompt, closesOn) => {
    expect(renewalPromptFor(input(now, overrides))).toEqual({
      prompt,
      closesOn,
    })
  })

  describe('a viewer with any ban gets no prompt', () => {
    it.each<[string, string, Overrides]>([
      [
        'uncleared banned named successor',
        '2027-08-02T15:00:00Z',
        {
          viewer: { ...named, isCleared: false, isBanned: true },
          chapter: someoneNamed,
        },
      ],
      [
        'cleared banned named successor (live media ban)',
        '2027-08-02T15:00:00Z',
        { viewer: { ...named, isBanned: true }, chapter: someoneNamed },
      ],
      [
        'banned named successor of a confirmed chapter',
        '2027-08-20T15:00:00Z',
        { viewer: { ...named, isBanned: true }, chapter: confirmed },
      ],
      [
        'banned admin in May',
        '2027-05-03T15:00:00Z',
        { viewer: { ...admin, isBanned: true } },
      ],
      [
        'banned admin in June',
        '2027-06-03T15:00:00Z',
        { viewer: { ...admin, isBanned: true } },
      ],
      [
        'banned admin, someone named',
        '2027-06-20T15:00:00Z',
        { viewer: { ...admin, isBanned: true }, chapter: someoneNamed },
      ],
      [
        'banned member at the member stage',
        '2027-09-16T15:00:00Z',
        { viewer: { isBanned: true } },
      ],
      [
        'banned uncleared member at the member stage',
        '2027-09-16T15:00:00Z',
        { viewer: { isBanned: true, isCleared: false } },
      ],
      [
        'banned member who stepped down, at the member stage',
        '2027-09-16T15:00:00Z',
        { viewer: { ...declined, isBanned: true } },
      ],
    ])('%s', (_label, now, overrides) => {
      expect(renewalPromptFor(input(now, overrides))).toEqual({
        prompt: 'none',
        closesOn: null,
      })
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
        'admin before the moved member stage, nobody named',
        '2027-09-16T15:00:00Z',
        { dates: movedMemberStage, viewer: admin },
        'name-successor-reminder',
        '2027-10-15',
      ],
      [
        'plain member at the moved member stage',
        '2027-09-22T12:00:00Z',
        { dates: movedMemberStage },
        'member-must-answer',
        '2027-10-15',
      ],
      [
        'close date moved behind now',
        '2027-09-25T14:00:00Z',
        { dates: { ...DATES, closeDate: '09-24' }, viewer: declined },
        'none',
        '2028-09-24',
      ],
      [
        'close date on Dec 31 closes on Jan 1 noon UTC',
        '2027-12-31T20:00:00Z',
        {
          dates: {
            nominationsOpen: '01-15',
            adminReminder: '02-01',
            successorConfirmation: '03-01',
            memberStage: '04-01',
            closeDate: '12-31',
          },
        },
        'member-must-answer',
        '2027-12-31',
      ],
      [
        'close date on Dec 31, on Jan 1 before the close instant',
        '2028-01-01T05:00:00Z',
        {
          dates: {
            nominationsOpen: '01-15',
            adminReminder: '02-01',
            successorConfirmation: '03-01',
            memberStage: '04-01',
            closeDate: '12-31',
          },
        },
        'member-must-answer',
        '2027-12-31',
      ],
    ])('%s', (_label, now, overrides, prompt, closesOn) => {
      expect(renewalPromptFor(input(now, overrides))).toEqual({
        prompt,
        closesOn,
      })
    })
  })
})

describe('renewalControlsFor', () => {
  it.each<[string, string, Overrides, boolean, boolean]>([
    [
      'flag off',
      '2027-05-03T15:00:00Z',
      { dates: null, viewer: admin },
      false,
      false,
    ],
    [
      'admin before nominations open',
      '2027-04-30T15:00:00Z',
      { viewer: admin },
      false,
      false,
    ],
    [
      'unnamed admin when nominations open',
      '2027-05-01T12:00:00Z',
      { viewer: admin },
      true,
      false,
    ],
    [
      'unnamed admin in May',
      '2027-05-03T15:00:00Z',
      { viewer: admin },
      true,
      false,
    ],
    [
      'unnamed admin in June, someone else named',
      '2027-06-05T15:00:00Z',
      { viewer: admin, chapter: someoneNamed },
      true,
      false,
    ],
    [
      'unnamed admin just before the successor date',
      '2027-08-01T11:59:00Z',
      { viewer: admin },
      true,
      false,
    ],
    [
      'unnamed admin at the successor date',
      '2027-08-01T12:00:00Z',
      { viewer: admin },
      true,
      true,
    ],
    [
      'unnamed admin after the successor date',
      '2027-08-10T15:00:00Z',
      { viewer: admin },
      true,
      true,
    ],
    [
      'named admin',
      '2027-05-03T15:00:00Z',
      { viewer: { ...admin, ...named }, chapter: someoneNamed },
      false,
      false,
    ],
    [
      'admin who stepped down',
      '2027-08-09T15:00:00Z',
      { viewer: { ...admin, ...declined } },
      false,
      true,
    ],
    [
      'admin of a confirmed chapter',
      '2027-08-20T15:00:00Z',
      { viewer: admin, chapter: confirmed },
      false,
      true,
    ],
    [
      'unnamed admin when the member stage starts',
      '2027-09-15T12:00:00Z',
      { viewer: admin },
      false,
      true,
    ],
    [
      'admin at the member stage',
      '2027-09-16T15:00:00Z',
      { viewer: admin },
      false,
      true,
    ],
    ['plain member in May', '2027-05-03T15:00:00Z', {}, false, false],
    [
      'uncleared admin in May',
      '2027-05-03T15:00:00Z',
      { viewer: { ...admin, isCleared: false } },
      false,
      false,
    ],
    [
      'banned admin in May',
      '2027-05-03T15:00:00Z',
      { viewer: { ...admin, isBanned: true } },
      false,
      false,
    ],
    [
      'banned admin after the successor date',
      '2027-08-10T15:00:00Z',
      { viewer: { ...admin, isBanned: true } },
      false,
      false,
    ],
    [
      'admin of a closed chapter',
      '2027-05-03T15:00:00Z',
      {
        viewer: admin,
        chapter: { closedAt: new Date('2027-03-01T00:00:00Z') },
      },
      false,
      false,
    ],
    [
      'admin of a chapter not renewing this cycle',
      '2027-08-10T15:00:00Z',
      {
        viewer: admin,
        chapter: { createdAt: new Date('2027-07-20T00:00:00Z') },
      },
      false,
      false,
    ],
  ])('%s', (_label, now, overrides, canNameSelf, namingSelfAccepts) => {
    expect(renewalControlsFor(input(now, overrides))).toEqual({
      canNameSelf,
      namingSelfAccepts,
    })
  })
})
