import {
  ALL_CERTS_TYPE,
  ALL_SUBJECTS_TYPE,
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
} from '../constants'
import { getEnumKeyByEnumValue } from './enum-utils'

export function getSubjectType(
  subject: ALL_CERTS_TYPE | ALL_SUBJECTS_TYPE
): SUBJECT_TYPES {
  const type =
    getEnumKeyByEnumValue(MATH_CERTS, subject as ALL_CERTS_TYPE) ||
    getEnumKeyByEnumValue(MATH_SUBJECTS, subject as ALL_SUBJECTS_TYPE)
      ? SUBJECT_TYPES.MATH
      : getEnumKeyByEnumValue(SCIENCE_CERTS, subject as ALL_CERTS_TYPE) ||
        getEnumKeyByEnumValue(SCIENCE_SUBJECTS, subject as ALL_SUBJECTS_TYPE)
      ? SUBJECT_TYPES.SCIENCE
      : getEnumKeyByEnumValue(COLLEGE_CERTS, subject as ALL_CERTS_TYPE) ||
        getEnumKeyByEnumValue(COLLEGE_SUBJECTS, subject as ALL_SUBJECTS_TYPE)
      ? SUBJECT_TYPES.COLLEGE
      : getEnumKeyByEnumValue(SAT_CERTS, subject as ALL_CERTS_TYPE) ||
        getEnumKeyByEnumValue(SAT_SUBJECTS, subject as ALL_SUBJECTS_TYPE)
      ? SUBJECT_TYPES.SAT
      : getEnumKeyByEnumValue(
          READING_WRITING_CERTS,
          subject as ALL_CERTS_TYPE
        ) ||
        getEnumKeyByEnumValue(
          READING_WRITING_SUBJECTS,
          subject as ALL_SUBJECTS_TYPE
        )
      ? SUBJECT_TYPES.READING_WRITING
      : getEnumKeyByEnumValue(TRAINING, subject as ALL_CERTS_TYPE)
      ? SUBJECT_TYPES.TRAINING
      : undefined

  if (!type)
    throw new Error('Provided subject/cert has no associated subject type')
  return type
}

export default getSubjectType
