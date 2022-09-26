export enum USER_SESSION_METRICS {
  absentStudent = 'Absent student',
  absentVolunteer = 'Absent volunteer',
  lowSessionRatingFromCoach = 'Low session rating from coach',
  lowSessionRatingFromStudent = 'Low session rating from student',
  lowCoachRatingFromStudent = 'Low coach rating from student',
  reported = 'Reported',
  onlyLookingForAnswers = 'Pressuring coach',
  rudeOrInappropriate = 'Mean or inappropriate',
  commentFromStudent = 'Comment from student',
  commentFromVolunteer = 'Comment from volunteer',
  hasBeenUnmatched = 'Has been unmatched',
  hasHadTechnicalIssues = 'Has had technical issues',
  personalIdentifyingInfo = 'PII',
  gradedAssignment = 'Graded assignment',
  coachUncomfortable = 'Coach uncomfortable',
  studentCrisis = 'Student in distress',
}

// amount of volunteers to text notifications to per session
export const TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP = 15

export const SESSION_REPORT_REASON = {
  STUDENT_RUDE: 'This student was extremely rude or inappropriate',
  STUDENT_SAFETY: 'I am worried for the immediate safety of this student',
}

export const SESSION_ACTIVITY_KEY = 'activity-prompt'

export const CHATBOT_EMAIL = 'chatbot@upchieve.org'

export const CHATBOT_CACHE_KEY = 'chatbot'
