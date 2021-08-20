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

export const BASE_SESSION_FLAGS = {
  ABSENT_USER: {
    key: SESSION_FLAGS.ABSENT_USER,
    causedReview: false,
    metadata: []
  },
  COMMENT: {
    key: SESSION_FLAGS.COMMENT,
    causedReview: true,
    metadata: []
  },
  FIRST_TIME_VOLUNTEER: {
    key: SESSION_FLAGS.FIRST_TIME_VOLUNTEER,
    causedReview: true,
    metadata: []
  },
  FIRST_TIME_STUDENT: {
    key: SESSION_FLAGS.FIRST_TIME_STUDENT,
    causedReview: true,
    metadata: []
  },
  LOW_MESSAGES: {
    key: SESSION_FLAGS.LOW_MESSAGES,
    causedReview: false,
    metadata: []
  },
  REPORTED: {
    key: SESSION_FLAGS.REPORTED,
    causedReview: true,
    metadata: []
  },
  STUDENT_RATING: {
    key: SESSION_FLAGS.STUDENT_RATING,
    causedReview: true,
    metadata: []
  },
  VOLUNTEER_RATING: {
    key: SESSION_FLAGS.VOLUNTEER_RATING,
    causedReview: true,
    metadata: []
  },
  UNMATCHED: {
    key: SESSION_FLAGS.UNMATCHED,
    causedReview: false,
    metadata: []
  }
}
