import { SUBJECT_TYPES, ALL_CERTS_TYPE } from '../constants'
import getSubjectType from './getSubjectType'
import { Certifications } from '../models/Volunteer'

export function countCertsByType(
  certifications: Certifications
): {
  total: number
  [SUBJECT_TYPES.MATH]: number
  [SUBJECT_TYPES.SCIENCE]: number
  [SUBJECT_TYPES.COLLEGE]: number
  [SUBJECT_TYPES.SAT]: number
  [SUBJECT_TYPES.TRAINING]: number
  [SUBJECT_TYPES.READING_WRITING]: number
} {
  const totals = {
    total: 0,
    [SUBJECT_TYPES.MATH]: 0,
    [SUBJECT_TYPES.SCIENCE]: 0,
    [SUBJECT_TYPES.COLLEGE]: 0,
    [SUBJECT_TYPES.SAT]: 0,
    [SUBJECT_TYPES.TRAINING]: 0,
    [SUBJECT_TYPES.READING_WRITING]: 0
  }

  for (const subject in certifications) {
    if (certifications[subject as ALL_CERTS_TYPE].passed) {
      const subjectType = getSubjectType(subject as ALL_CERTS_TYPE)
      totals[subjectType]++
      totals.total++
    }
  }
  return totals
}
