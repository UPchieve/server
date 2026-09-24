import { schoolYearFor } from '../../utils/school-year'

describe('schoolYearFor', () => {
  test.each([
    [
      'the last instant of June belongs to the year that is ending',
      '2026-06-30T23:59:59.999Z',
      '2025–26',
      '2025-07-01T00:00:00.000Z',
      '2026-07-01T00:00:00.000Z',
    ],
    [
      'July 1 at midnight starts the new year',
      '2026-07-01T00:00:00.000Z',
      '2026–27',
      '2026-07-01T00:00:00.000Z',
      '2027-07-01T00:00:00.000Z',
    ],
    [
      'December belongs to the year that started the previous July',
      '2026-12-15T12:00:00.000Z',
      '2026–27',
      '2026-07-01T00:00:00.000Z',
      '2027-07-01T00:00:00.000Z',
    ],
  ])('%s', (_name, instant, label, startsAt, endsAt) => {
    const year = schoolYearFor(new Date(instant))
    expect(year.label).toBe(label)
    expect(year.startsAt.toISOString()).toBe(startsAt)
    expect(year.endsAt.toISOString()).toBe(endsAt)
  })
})
