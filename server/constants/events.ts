export enum SESSION_EVENTS {
  SESSION_ENDED = 'session-ended',
  SESSION_REPORTED = 'session-reported',
  SESSION_METRICS_CALCULATED = 'session-metrics-calculated',
  PAST_SESSION_ADDED = 'past-session-added',
  SESSION_FLAGS_SET = 'session-flags-set',
  FEEDBACK_FLAGS_SET = 'feedback-flags-set',
  REPORT_FLAGS_SET = 'report-flags-set',
  SESSION_REVIEW_REASONS_SET = 'session-review-reasons-set',
  FEEDBACK_REVIEW_REASONS_SET = 'feedback-review-reasons-set',
  REPORT_REVIEW_REASONS_SET = 'report-review-reasons-set',
}

export enum FEEDBACK_EVENTS {
  FEEDBACK_SAVED = 'feedback-saved',
}

export enum USM_EVENTS {
  SESSION_PROCESSORS_READY = 'session-processors-ready',
  FEEDBACK_PROCESSORS_READY = 'feedback-processors-ready',
  REPORT_PROCESSORS_READY = 'report-processors-ready',
}

export enum STUDENT_EVENTS {
  STUDENT_CREATED = 'student-created',
}

export enum USER_EVENTS {
  USER_CREATED = 'user-created',
}
