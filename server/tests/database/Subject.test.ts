/**
 * @group database/parallel
 */
import { getClient } from '../../db'
import * as SubjectRepo from '../../models/Subjects'
import { SUBJECTS } from '../../constants'

const client = getClient()
describe('getRequiredCertificationsByComputedSubjectUnlock', () => {
  it.each([
    [
      SUBJECTS.INTEGRATED_MATH_ONE,
      new Set<SUBJECTS>([
        SUBJECTS.STATISTICS,
        SUBJECTS.GEOMETRY,
        SUBJECTS.ALGEBRA_ONE,
      ]),
    ],
    [
      SUBJECTS.INTEGRATED_MATH_TWO,
      new Set<SUBJECTS>([
        SUBJECTS.STATISTICS,
        SUBJECTS.GEOMETRY,
        SUBJECTS.ALGEBRA_ONE,
        SUBJECTS.TRIGONOMETRY,
      ]),
    ],
    [
      SUBJECTS.INTEGRATED_MATH_THREE,
      new Set<SUBJECTS>([SUBJECTS.STATISTICS, SUBJECTS.PRECALCULUS]),
    ],
    [SUBJECTS.INTEGRATED_MATH_FOUR, new Set<SUBJECTS>([SUBJECTS.PRECALCULUS])],
  ])(
    'Returns the required certifications for the given subject',
    async (
      computedSubject: SUBJECTS,
      requiredCertifications: Set<SUBJECTS>
    ) => {
      const actual =
        await SubjectRepo.getRequiredCertificationsByComputedSubjectUnlock(
          computedSubject
        )
      expect(new Set<SUBJECTS>(actual!)).toEqual(
        new Set<SUBJECTS>(requiredCertifications)
      )
    }
  )

  it('Returns undefined if the subject is not a computed subject unlock', async () => {
    const actual =
      await SubjectRepo.getRequiredCertificationsByComputedSubjectUnlock(
        SUBJECTS.ALGEBRA_ONE
      )
    expect(actual).toBeUndefined()
  })
})
