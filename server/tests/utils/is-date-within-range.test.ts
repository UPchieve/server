import { isDateWithinRange } from '../../utils/is-date-within-range'

describe('isDateWithinRange', () => {
  test('Should not be within the date range if date before the start date', () => {
    const date = new Date('2021-09-01T01:00:00.000Z')
    const startDate = new Date('2021-10-01T01:00:00.000Z')
    const endDate = new Date('2021-11-01T01:00:00.000Z')
    const result = isDateWithinRange(date, startDate, endDate)

    expect(result).toBeFalsy()
  })

  test('Should not be within the date range if date before the end date', () => {
    const date = new Date('2021-12-01T01:00:00.000Z')
    const startDate = new Date('2021-10-01T01:00:00.000Z')
    const endDate = new Date('2021-11-01T01:00:00.000Z')
    const result = isDateWithinRange(date, startDate, endDate)

    expect(result).toBeFalsy()
  })

  test('Should be within the date range if the date is within the date range', () => {
    const date = new Date('2021-10-15T01:00:00.000Z')
    const startDate = new Date('2021-10-01T01:00:00.000Z')
    const endDate = new Date('2021-11-01T01:00:00.000Z')
    const result = isDateWithinRange(date, startDate, endDate)

    expect(result).toBeTruthy()
  })
})
