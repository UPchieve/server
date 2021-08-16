export enum FEEDBACK_VERSIONS {
  'ONE' = 1,
  'TWO'
}

export const SESSION_REPORT_REASON = {
  STUDENT_RUDE: 'This student was extremely rude or inappropriate',
  STUDENT_SAFETY: 'I am worried for the immediate safety of this student'
}

export enum SURVEY_TYPES {
  STUDENT_PRESESSION = 'student pre-session',
  STUDENT_POSTSESSION = 'student post-session'
}

export enum SESSION_FLAGS {
  ABSENT_USER = 'ABSENT_USER',
  COMMENT = 'COMMENT',
  FIRST_TIME_VOLUNTEER = 'FIRST_TIME_VOLUNTEER',
  FIRST_TIME_STUDENT = 'FIRST_TIME_STUDENT',
  LOW_MESSAGES = 'LOW_MESSAGES',
  REPORTED = 'REPORTED',
  STUDENT_RATING = 'STUDENT_RATING',
  VOLUNTEER_RATING = 'VOLUNTEER_RATING',
  UNMATCHED = 'UNMATCHED'
}

// amount of volunteers to text notifications to per session
export const TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP = 15
