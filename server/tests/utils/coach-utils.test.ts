import { canCoach, canCoachSubject } from '../../utils/coach-utils'
import { USER_BAN_TYPES } from '../../constants'
import { SUBJECTS } from '../../constants/subjects'
import { buildVolunteerSessionHoldEligibilityData } from '../mocks/generate'

describe('canCoach', () => {
  test('a ready, unbanned, active coach can coach', () => {
    expect(canCoach(buildVolunteerSessionHoldEligibilityData())).toBe(true)
  })

  test.each([
    ['not ready to coach', { isReadyToCoach: false }],
    ['completely banned', { banType: USER_BAN_TYPES.COMPLETE }],
    ['shadow banned', { banType: USER_BAN_TYPES.SHADOW }],
    ['deactivated', { isDeactivated: true }],
  ])('a coach who is %s cannot coach', (_, overrides) => {
    expect(canCoach(buildVolunteerSessionHoldEligibilityData(overrides))).toBe(
      false
    )
  })

  test('a coach banned only from live media can coach', () => {
    expect(
      canCoach(
        buildVolunteerSessionHoldEligibilityData({
          banType: USER_BAN_TYPES.LIVE_MEDIA,
        })
      )
    ).toBe(true)
  })
})

describe('canCoachSubject', () => {
  const subject = 'algebraOne' as SUBJECTS

  test('a coach who can coach and has the subject unlocked can coach it', () => {
    expect(
      canCoachSubject(
        buildVolunteerSessionHoldEligibilityData({
          unlockedSubjects: [subject],
        }),
        subject
      )
    ).toBe(true)
  })

  test('a coach who has not unlocked the subject cannot coach it', () => {
    expect(
      canCoachSubject(
        buildVolunteerSessionHoldEligibilityData({ unlockedSubjects: [] }),
        subject
      )
    ).toBe(false)
  })

  test('a coach who muted the subject cannot coach it', () => {
    expect(
      canCoachSubject(
        buildVolunteerSessionHoldEligibilityData({
          unlockedSubjects: [subject],
          mutedSubjects: [subject],
        }),
        subject
      )
    ).toBe(false)
  })

  test('a coach who cannot coach cannot coach the subject', () => {
    expect(
      canCoachSubject(
        buildVolunteerSessionHoldEligibilityData({
          unlockedSubjects: [subject],
          isDeactivated: true,
        }),
        subject
      )
    ).toBe(false)
  })
})
