export enum FEATURE_FLAGS {
  USING_OUR_PLATFORM = 'using-our-platform',
  COLLEGE_LIST_WORKSHEET = 'college-list-worksheet',
  FALL_INCENTIVE_PROGRAM = 'fall-incentive-program',
  TEACHER_GETTING_STARTED_ASSIGNMENT = 'teacher-getting-started-assignment',
  GET_SESSION_SUMMARY = 'get-session-summary',
  DISABLE_STUDENT_CREATION = 'disable-student-creation',
  ZWIBSERVE = 'zwibserve',
  STEM_PROGRESS_REPORT = 'stem-progress-report',
  STUDENT_SESSION_SUMMARY = 'student-session-summary',
  VOLUNTEER_ASYNC_ESSAY_REVIEW = 'volunteer-async-essay-review',
  VOLUNTEER_ASYNC_ESSAY_REVIEW_EMAIL_NOTIFICATIONS = 'volunteer-async-essay-review-email-notifications',
  PHOTODNA_MATCH_CHECK = 'photodna-match-check',
  NTHS_APPLY_PREVIEW_PAGE = 'nths-apply-preview-page',
  // The following flags are for gating risky features, NOT features being
  // experimented/slowly rolled out.
  // They are never to be removed as part of a "launch".
  BLOCK_SESSION_IMAGE_UPLOAD = 'block-session-image-upload',
  BLOCK_SCREENSHARE = 'block-screenshare',
  BLOCK_AUDIO_CALL = 'block-audio-call',
  SESSION_HOLDS_COACH = 'session-holds-coach',
  SESSION_HOLDS_STUDENT = 'session-holds-student',
}
