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
  coachReportedStudentDm = 'Coach reported student DM',
  studentReportedCoachDm = 'Student reported coach DM',
}

// amount of volunteers to text notifications to per session
export const TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP = 15

export const SESSION_REPORT_REASON = {
  STUDENT_RUDE: 'This student was extremely rude or inappropriate',
  STUDENT_SAFETY: 'I am worried for the immediate safety of this student',
  COACH_DM_TO_STUDENT_CONNECT_OFFLINE:
    'Coach asked me to connect off of UPchieve',
  COACH_DM_TO_STUDENT_FELT_UNCOMFORTABLE:
    'Coach made me feel uncomfortable or unsafe',
  COACH_DM_TO_STUDENT_INAPPROPRIATE_LANGUAGE:
    'Coach used inappropriate language',
  COACH_DM_TO_STUDENT_TALKED_INAPPROPRIATE:
    'Coach talked about inappropriate and offensive topics',
}

export const SESSION_ACTIVITY_KEY = 'activity-prompt'

export const CHATBOT_EMAIL = 'chatbot@upchieve.org'

export const CHATBOT_CACHE_KEY = 'chatbot'

export enum TOOL_TYPES {
  WHITEBOARD = 'whiteboard',
  DOCUMENT_EDITOR = 'documenteditor',
}
