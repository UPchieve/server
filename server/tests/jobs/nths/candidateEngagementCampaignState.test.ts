import {
  NTHSCampaignState,
  selectNTHSCampaignEmail,
} from '../../../worker/jobs/nths/candidateEngagementCampaignState'
import moment from 'moment'
import 'moment-timezone'

const APPROVED_AT = new Date('2026-10-01T14:00:00.000Z')

function atCampaignDay(day: number, hour = 10): Date {
  return moment(APPROVED_AT)
    .tz('America/New_York')
    .startOf('day')
    .add(day, 'days')
    .hour(hour)
    .toDate()
}

function state(overrides: Partial<NTHSCampaignState> = {}): NTHSCampaignState {
  return {
    approvedAt: APPROVED_AT,
    chapterId: 'chapter-id',
    membersCount: 1,
    sentAt: {},
    ...overrides,
  }
}

describe('selectNTHSCampaignEmail', () => {
  test('uses whole America/New_York calendar days from approval', () => {
    expect(
      selectNTHSCampaignEmail(state(), atCampaignDay(2, 23))
    ).toBeUndefined()
    expect(selectNTHSCampaignEmail(state(), atCampaignDay(3, 0))?.email).toBe(
      'recruitingDay3'
    )
  })

  test('selects the setup reminder on day 3 when there is no chapter', () => {
    expect(
      selectNTHSCampaignEmail(
        state({ chapterId: undefined, membersCount: 0 }),
        atCampaignDay(3)
      )?.email
    ).toBe('setupDay3')
  })

  test('sends R2 and R3 to presidents who still have no chapter', () => {
    expect(
      selectNTHSCampaignEmail(
        state({
          chapterId: undefined,
          membersCount: 0,
          sentAt: { setupDay3: atCampaignDay(3) },
        }),
        atCampaignDay(8)
      )?.email
    ).toBe('recruitingDay8')
    expect(
      selectNTHSCampaignEmail(
        state({
          chapterId: undefined,
          membersCount: 0,
          sentAt: { recruitingDay8: atCampaignDay(8) },
        }),
        atCampaignDay(14)
      )?.email
    ).toBe('recruitingDay14')
  })

  test('does not send R4 without a chapter', () => {
    expect(
      selectNTHSCampaignEmail(
        state({
          chapterId: undefined,
          membersCount: 0,
          sentAt: { recruitingDay14: atCampaignDay(14) },
        }),
        atCampaignDay(18)
      )
    ).toBeUndefined()
  })

  test('sends R4 to a solo president', () => {
    expect(
      selectNTHSCampaignEmail(
        state({ sentAt: { recruitingDay14: atCampaignDay(14) } }),
        atCampaignDay(18)
      )?.email
    ).toBe('recruitingDay18')
  })

  test('selects the latest due recruiting email after a missed run', () => {
    expect(selectNTHSCampaignEmail(state(), atCampaignDay(14))?.email).toBe(
      'recruitingDay14'
    )
  })

  test('selects no second email when the campaign already sent one today', () => {
    expect(
      selectNTHSCampaignEmail(
        state({ sentAt: { recruitingDay8: atCampaignDay(14, 7) } }),
        atCampaignDay(14, 10)
      )
    ).toBeUndefined()
  })

  test('does not move backward after a later recruiting email was sent', () => {
    expect(
      selectNTHSCampaignEmail(
        state({ sentAt: { recruitingDay14: atCampaignDay(14) } }),
        atCampaignDay(15)
      )
    ).toBeUndefined()
  })

  test('starts activation on the first run with three members through day 60', () => {
    expect(
      selectNTHSCampaignEmail(state({ membersCount: 3 }), atCampaignDay(10))
        ?.email
    ).toBe('activationA1')
    expect(
      selectNTHSCampaignEmail(state({ membersCount: 3 }), atCampaignDay(60))
        ?.email
    ).toBe('day21Extension')
    expect(
      selectNTHSCampaignEmail(
        state({
          membersCount: 3,
          sentAt: { day21Extension: atCampaignDay(21) },
        }),
        atCampaignDay(60)
      )?.email
    ).toBe('activationA1')
    expect(
      selectNTHSCampaignEmail(
        state({
          membersCount: 3,
          sentAt: { day21Extension: atCampaignDay(21) },
        }),
        atCampaignDay(61)
      )
    ).toBeUndefined()
  })

  test('stops recruiting after A1 and schedules A2 and A3 from A1', () => {
    const activationState = state({
      membersCount: 3,
      sentAt: { activationA1: atCampaignDay(10) },
    })
    expect(
      selectNTHSCampaignEmail(activationState, atCampaignDay(13))
    ).toBeUndefined()
    expect(
      selectNTHSCampaignEmail(activationState, atCampaignDay(14))?.email
    ).toBe('activationA2')
    expect(
      selectNTHSCampaignEmail(
        state({
          ...activationState,
          sentAt: {
            ...activationState.sentAt,
            activationA2: atCampaignDay(14),
          },
        }),
        atCampaignDay(19)
      )?.email
    ).toBe('activationA3')
  })

  test('skips a missed A2 when A3 is due and never moves backward', () => {
    const activationState = state({
      membersCount: 3,
      sentAt: { activationA1: atCampaignDay(5) },
    })
    expect(
      selectNTHSCampaignEmail(activationState, atCampaignDay(14))?.email
    ).toBe('activationA3')
    expect(
      selectNTHSCampaignEmail(
        state({
          ...activationState,
          sentAt: {
            ...activationState.sentAt,
            activationA3: atCampaignDay(14),
          },
        }),
        atCampaignDay(15)
      )
    ).toBeUndefined()
  })

  test('gives D21 precedence and extends the launch date to day 60', () => {
    const selection = selectNTHSCampaignEmail(state(), atCampaignDay(21))

    expect(selection).toMatchObject({
      email: 'day21Extension',
      campaignDay: 21,
      daysLeft: 39,
    })
    expect(selection?.launchDate.toISOString()).toBe('2026-11-30T05:00:00.000Z')
  })

  test('keeps the extended launch date for later emails', () => {
    const selection = selectNTHSCampaignEmail(
      state({
        membersCount: 3,
        sentAt: {
          activationA1: atCampaignDay(18),
          day21Extension: atCampaignDay(21),
        },
      }),
      atCampaignDay(22)
    )

    expect(selection?.email).toBe('activationA2')
    expect(selection?.launchDate.toISOString()).toBe('2026-11-30T05:00:00.000Z')
  })

  test('does not return to fixed-day recruiting emails after D21', () => {
    expect(
      selectNTHSCampaignEmail(
        state({ sentAt: { day21Extension: atCampaignDay(21) } }),
        atCampaignDay(22)
      )
    ).toBeUndefined()
  })

  test('does not send D21 without a chapter', () => {
    expect(
      selectNTHSCampaignEmail(
        state({
          chapterId: undefined,
          membersCount: 0,
          sentAt: { recruitingDay14: atCampaignDay(14) },
        }),
        atCampaignDay(21)
      )
    ).toBeUndefined()
  })
})
