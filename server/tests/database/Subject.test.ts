/**
 * @group database/parallel
 */
import * as SubjectRepo from '../../models/Subjects'
import { SUBJECTS } from '../../constants'

describe('getRequiredCertificationsByComputedSubjectUnlock', () => {
  const expectedMapping = {
    [SUBJECTS.INTEGRATED_MATH_ONE]: [
      SUBJECTS.GEOMETRY,
      SUBJECTS.STATISTICS,
      SUBJECTS.ALGEBRA_ONE,
    ],
    [SUBJECTS.INTEGRATED_MATH_TWO]: [
      SUBJECTS.GEOMETRY,
      SUBJECTS.TRIGONOMETRY,
      SUBJECTS.STATISTICS,
      SUBJECTS.ALGEBRA_ONE,
    ],
    [SUBJECTS.INTEGRATED_MATH_THREE]: [
      SUBJECTS.STATISTICS,
      SUBJECTS.PRECALCULUS,
    ],
    [SUBJECTS.INTEGRATED_MATH_FOUR]: [SUBJECTS.PRECALCULUS],
  }
  it('Returns the required certifications for computed subjects', async () => {
    const actual =
      await SubjectRepo.getRequiredCertificationsByComputedSubjectUnlock()
    const actualKeys = Object.keys(actual) as SUBJECTS[]
    const expectedKeys = Object.keys(expectedMapping) as SUBJECTS[]
    expect(new Set<SUBJECTS>(actualKeys)).toEqual(
      new Set<SUBJECTS>(expectedKeys)
    )

    expect(actual).toEqual(expectedMapping)
  })
})
