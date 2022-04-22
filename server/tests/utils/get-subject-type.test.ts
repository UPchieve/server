import {
  SUBJECT_TYPES,
  MATH_CERTS,
  SCIENCE_CERTS,
  COLLEGE_CERTS,
  READING_WRITING_CERTS,
  SAT_CERTS,
  TRAINING,
} from '../../constants'
import { getSubjectType } from '../../utils/getSubjectType'

describe('Get subject type', () => {
  test('Math', () => {
    expect(getSubjectType(MATH_CERTS.ALGEBRA_ONE)).toEqual(SUBJECT_TYPES.MATH)
  })
  test('Science', () => {
    expect(getSubjectType(SCIENCE_CERTS.BIOLOGY)).toEqual(SUBJECT_TYPES.SCIENCE)
  })
  test('SAT', () => {
    expect(getSubjectType(SAT_CERTS.SAT_MATH)).toEqual(SUBJECT_TYPES.SAT)
  })
  test('College', () => {
    expect(getSubjectType(COLLEGE_CERTS.APPLICATIONS)).toEqual(
      SUBJECT_TYPES.COLLEGE
    )
  })
  test('Reading and writing', () => {
    expect(getSubjectType(READING_WRITING_CERTS.HUMANITIES_ESSAYS)).toEqual(
      SUBJECT_TYPES.READING_WRITING
    )
  })
  test('Reading and writing', () => {
    expect(getSubjectType(READING_WRITING_CERTS.READING)).toEqual(
      SUBJECT_TYPES.READING_WRITING
    )
  })
  test('Training', () => {
    expect(getSubjectType(TRAINING.UPCHIEVE_101)).toEqual(
      SUBJECT_TYPES.TRAINING
    )
  })
  test('Invalid subject', () => {
    expect(() => getSubjectType('hello')).toThrow()
  })
})
