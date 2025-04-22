import { Uuid } from '../pgUtils'

export type UserSessionMetrics = {
  userId: Uuid
  absentStudent: number
  absentVolunteer: number
  lowSessionRatingFromCoach: number
  lowSessionRatingFromStudent: number
  lowCoachRatingFromStudent: number
  reported: number
  onlyLookingForAnswers: number
  rudeOrInappropriate: number
  commentFromStudent: number
  commentFromVolunteer: number
  hasBeenUnmatched: number
  hasHadTechnicalIssues: number
  personalIdentifyingInfo: number
  gradedAssignment: number
  coachUncomfortable: number
  studentCrisis: number
  createdAt: Date
}
