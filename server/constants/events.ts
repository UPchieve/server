export enum SESSION_EVENTS {
  SESSION_ENDED = 'session-ended',
  FLAGS_SET = 'session-flags-set',
  SESSION_METRICS_CALCULATED = 'session-metrics-calculated',
  PAST_SESSION_ADDED = 'past-session-added',
  REVIEW_REASONS_SET = 'session-review-reasons-set'
}

export enum FEEDBACK_EVENTS {
  FEEDBACK_SAVED = 'feedback-saved'
}

export enum USM_EVENTS {
  SESSION_USM_CALCULATED = 'session-usm-calculated',
  FEEDBACK_USM_CALCULATED = 'feedback-usm-calculated',
  PROCESSORS_READY = 'processors-ready'
}
