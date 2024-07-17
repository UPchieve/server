import { FORMAT_SUBJECT_TO_DISPLAY_NAME } from '../constants'

// TODO: should take proper subject type
const formatMultiWordSubject = (subject: string): string => {
  const formattedSubject =
    FORMAT_SUBJECT_TO_DISPLAY_NAME[
      subject as keyof typeof FORMAT_SUBJECT_TO_DISPLAY_NAME
    ]
  if (formattedSubject) return formattedSubject
  return subject
}

export default formatMultiWordSubject
