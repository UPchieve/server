import { SUBJECT_TYPES } from '../constants'
import getSubjectType from './getSubjectType'

export function countCertsByType(
  certifications
): {
  total: number
  [SUBJECT_TYPES.MATH]: number
  [SUBJECT_TYPES.SCIENCE]: number
  [SUBJECT_TYPES.COLLEGE]: number
  [SUBJECT_TYPES.SAT]: number
  [SUBJECT_TYPES.TRAINING]: number
} {
  const totals = {
    total: 0,
    [SUBJECT_TYPES.MATH]: 0,
    [SUBJECT_TYPES.SCIENCE]: 0,
    [SUBJECT_TYPES.COLLEGE]: 0,
    [SUBJECT_TYPES.SAT]: 0,
    [SUBJECT_TYPES.TRAINING]: 0
  }

  for (const subject in certifications) {
    if (certifications[subject].passed) {
      const subjectType = getSubjectType(subject)
      totals[subjectType]++
      totals.total++
    }
  }
  return totals
}
