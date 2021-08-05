import { FORMAT_SUBJECT_TO_DISPLAY_NAME } from '../constants'

const formatMultiWordSubject = (subject): string => {
  const formattedSubject = FORMAT_SUBJECT_TO_DISPLAY_NAME[subject]
  if (formattedSubject) return formattedSubject
  return subject
}

export default formatMultiWordSubject
