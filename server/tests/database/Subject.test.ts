/**
 * @group database/parallel
 */
import * as SubjectRepo from '../../models/Subjects'
import { SUBJECTS } from '../../constants'

describe('getRequiredCertificationsByComputedSubjectUnlock', () => {
  const expectedMapping = {
    [SUBJECTS.INTEGRATED_MATH_ONE]: [
      SUBJECTS.ALGEBRA_ONE,
      SUBJECTS.GEOMETRY,
      SUBJECTS.STATISTICS,
    ],
    [SUBJECTS.INTEGRATED_MATH_TWO]: [
      SUBJECTS.ALGEBRA_ONE,
      SUBJECTS.GEOMETRY,
      SUBJECTS.STATISTICS,
      SUBJECTS.TRIGONOMETRY,
    ],
    [SUBJECTS.INTEGRATED_MATH_THREE]: [
      SUBJECTS.PRECALCULUS,
      SUBJECTS.STATISTICS,
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
