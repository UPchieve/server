import {
  SUBJECT_TYPES,
  MATH_CERTS,
  MATH_SUBJECTS,
  SCIENCE_CERTS,
  SCIENCE_SUBJECTS,
  COLLEGE_CERTS,
  COLLEGE_SUBJECTS,
  READING_WRITING_CERTS,
  READING_WRITING_SUBJECTS,
  SAT_CERTS,
  SAT_SUBJECTS,
  TRAINING,
} from '../../constants'
import { ALL_CERTS_TYPE } from '../../models/Volunteer'
import getSubjectType from '../../utils/getSubjectType'

describe('Get subject type', () => {
  test('Math', () => {
    expect(getSubjectType(MATH_CERTS.ALGEBRA)).toEqual(SUBJECT_TYPES.MATH)
    expect(getSubjectType(MATH_SUBJECTS.PREALGEBRA)).toEqual(SUBJECT_TYPES.MATH)
  })
  test('Science', () => {
    expect(getSubjectType(SCIENCE_CERTS.BIOLOGY)).toEqual(SUBJECT_TYPES.SCIENCE)
    expect(getSubjectType(SCIENCE_SUBJECTS.BIOLOGY)).toEqual(
      SUBJECT_TYPES.SCIENCE
    )
  })
  test('SAT', () => {
    expect(getSubjectType(SAT_CERTS.SAT_MATH)).toEqual(SUBJECT_TYPES.SAT)
    expect(getSubjectType(SAT_SUBJECTS.SAT_MATH)).toEqual(SUBJECT_TYPES.SAT)
  })
  test('College', () => {
    expect(getSubjectType(COLLEGE_CERTS.APPLICATIONS)).toEqual(
      SUBJECT_TYPES.COLLEGE
    )
    expect(getSubjectType(COLLEGE_SUBJECTS.APPLICATIONS)).toEqual(
      SUBJECT_TYPES.COLLEGE
    )
  })
  test('Reading and writing', () => {
    expect(getSubjectType(READING_WRITING_CERTS.HUMANITIES_ESSAYS)).toEqual(
      SUBJECT_TYPES.READING_WRITING
    )
    expect(getSubjectType(READING_WRITING_SUBJECTS.HUMANITIES_ESSAYS)).toEqual(
      SUBJECT_TYPES.READING_WRITING
    )
  })
  test('Training', () => {
    expect(getSubjectType(TRAINING.UPCHIEVE_101)).toEqual(
      SUBJECT_TYPES.TRAINING
    )
  })
  test('Invalid subject', () => {
    expect(() => getSubjectType('hello' as ALL_CERTS_TYPE)).toThrow()
  })
})
