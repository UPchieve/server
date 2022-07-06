import { SUBJECT_TYPES } from '../constants'
import { getSubjectType } from './getSubjectType'
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
  [SUBJECT_TYPES.SOCIAL_STUDIES]: number
} {
  const totals: any = {
    total: 0,
    [SUBJECT_TYPES.MATH]: 0,
    [SUBJECT_TYPES.SCIENCE]: 0,
    [SUBJECT_TYPES.COLLEGE]: 0,
    [SUBJECT_TYPES.SAT]: 0,
    [SUBJECT_TYPES.TRAINING]: 0,
    [SUBJECT_TYPES.READING_WRITING]: 0,
    [SUBJECT_TYPES.SOCIAL_STUDIES]: 0,
  }

  for (const cert in certifications) {
    if (certifications[cert as keyof Certifications].passed) {
      const certType = getSubjectType(cert)
      totals[certType]++
      totals.total++
    }
  }
  return totals
}
