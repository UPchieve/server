import { Ulid } from '../pgUtils'

// TODO: Make this type essentially extend SessionMetrics
//       just with added userId and sessionId omitted
export type UserSessionMetrics = {
  userId: Ulid
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
