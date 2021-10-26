import {
  SUBJECT_TYPES,
  MATH_CERTS,
  SCIENCE_CERTS,
  COLLEGE_CERTS,
  READING_WRITING_CERTS,
  SAT_CERTS,
  TRAINING,
} from '../constants'
import { Certifications } from '../models/Volunteer'

export function getSubjectTypeForCert(
  cert: keyof Certifications
): SUBJECT_TYPES {
  let type: SUBJECT_TYPES | undefined
  if (Object.values<string>(MATH_CERTS).includes(cert))
    type = SUBJECT_TYPES.MATH
  if (Object.values<string>(SCIENCE_CERTS).includes(cert))
    type = SUBJECT_TYPES.SCIENCE
  if (Object.values<string>(COLLEGE_CERTS).includes(cert))
    type = SUBJECT_TYPES.COLLEGE
  if (Object.values<string>(SAT_CERTS).includes(cert)) type = SUBJECT_TYPES.SAT
  if (Object.values<string>(TRAINING).includes(cert))
    type = SUBJECT_TYPES.TRAINING
  if (Object.values<string>(READING_WRITING_CERTS).includes(cert))
    type = SUBJECT_TYPES.READING_WRITING

  if (type) return type
  throw new Error('Could not determine type of certification')
}
