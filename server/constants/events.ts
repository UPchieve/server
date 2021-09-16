export enum SESSION_EVENTS {
  SESSION_ENDED = 'session-ended',
  SESSION_METRICS_CALCULATED = 'session-metrics-calculated',
  PAST_SESSION_ADDED = 'past-session-added',
  SESSION_FLAGS_SET = 'session-flags-set',
  FEEDBACK_FLAGS_SET = 'feedback-flags-set',
  SESSION_REVIEW_REASONS_SET = 'session-review-reasons-set',
  FEEDBACK_REVIEW_REASONS_SET = 'feedback-review-reasons-set'
}

export enum FEEDBACK_EVENTS {
  FEEDBACK_SAVED = 'feedback-saved'
}

export enum USM_EVENTS {
  SESSION_PROCESSORS_READY = 'session-processors-ready',
  FEEDBACK_PROCESSORS_READY = 'feedback-processors-ready'
}
