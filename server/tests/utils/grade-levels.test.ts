import { GRADES } from '../../constants'
import { numberToGradeLevel } from '../../utils/grade-levels'

describe('numberToGradeLevel', () => {
  test.each([
    [6, GRADES.SIXTH],
    [9, GRADES.NINTH],
    [12, GRADES.TWELVETH],
  ])('converts %s to %s', (grade, expected) => {
    expect(numberToGradeLevel(grade)).toBe(expected)
  })
})
