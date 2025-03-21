import { Uuid } from '../pgUtils'

export type SessionMetrics = {
  sessionId: Uuid
  absentStudent: boolean
  absentVolunteer: boolean
  lowSessionRatingFromCoach: boolean
  lowSessionRatingFromStudent: boolean
  lowCoachRatingFromStudent: boolean
  reported: boolean
  onlyLookingForAnswers: boolean
  rudeOrInappropriate: boolean
  commentFromStudent: boolean
  commentFromVolunteer: boolean
  hasBeenUnmatched: boolean
  hasHadTechnicalIssues: boolean
  personalIdentifyingInfo: boolean
  gradedAssignment: boolean
  coachUncomfortable: boolean
  studentCrisis: boolean
  createdAt: Date
}
