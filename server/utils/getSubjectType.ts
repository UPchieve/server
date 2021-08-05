import {
  MATH_SUBJECTS,
  MATH_CERTS,
  SCIENCE_SUBJECTS,
  COLLEGE_SUBJECTS,
  SAT_SUBJECTS,
  READING_WRITING_SUBJECTS,
  TRAINING,
  SUBJECT_TYPES
} from '../constants'

const getSubjectType = (subject: string): string => {
  let type = ''

  if (Object.values(MATH_SUBJECTS).includes(subject)) type = SUBJECT_TYPES.MATH
  if (Object.values(typeof MATH_CERTS).includes(subject)) type = SUBJECT_TYPES.MATH
  if (Object.values(SCIENCE_SUBJECTS).includes(subject))
    type = SUBJECT_TYPES.SCIENCE
  if (Object.values(typeof COLLEGE_SUBJECTS).includes(subject))
    type = SUBJECT_TYPES.COLLEGE
  if (Object.values(SAT_SUBJECTS).includes(subject)) type = SUBJECT_TYPES.SAT
  if (Object.values(typeof TRAINING).includes(subject)) type = SUBJECT_TYPES.TRAINING
  if (Object.values(typeof READING_WRITING_SUBJECTS).includes(subject))
    type = SUBJECT_TYPES.READING_WRITING

  return type
}

export default getSubjectType
