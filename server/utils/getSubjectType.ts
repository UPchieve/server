import {
  MATH_SUBJECTS,
  MATH_CERTS,
  SCIENCE_SUBJECTS,
  COLLEGE_SUBJECTS,
  SAT_SUBJECTS,
  READING_WRITING_SUBJECTS,
  TRAINING,
  SUBJECT_TYPES,
} from '../constants'

export function getSubjectType(subject: string): string {
  let type: string | undefined

  if (Object.values<string>(MATH_SUBJECTS).includes(subject))
    type = SUBJECT_TYPES.MATH
  if (Object.values<string>(MATH_CERTS).includes(subject))
    type = SUBJECT_TYPES.MATH
  if (Object.values<string>(SCIENCE_SUBJECTS).includes(subject))
    type = SUBJECT_TYPES.SCIENCE
  if (Object.values<string>(COLLEGE_SUBJECTS).includes(subject))
    type = SUBJECT_TYPES.COLLEGE
  if (Object.values<string>(SAT_SUBJECTS).includes(subject))
    type = SUBJECT_TYPES.SAT
  if (Object.values<string>(TRAINING).includes(subject))
    type = SUBJECT_TYPES.TRAINING
  if (Object.values<string>(READING_WRITING_SUBJECTS).includes(subject))
    type = SUBJECT_TYPES.READING_WRITING

  if (!type) throw Error(`Cannot determine subject type for ${subject}`)
  return type
}
