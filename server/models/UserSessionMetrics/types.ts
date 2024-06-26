import { Ulid } from '../pgUtils'

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
  commentFromStudent: number // student has left a comment in the feedback form
  commentFromVolunteer: number // volunteer has left a comment in the feedback form
  hasBeenUnmatched: number // user has had sessions longer than 1 minute end unmatched
  hasHadTechnicalIssues: number // user has had sessions where the volunteer reported technical issues
  personalIdentifyingInfo: number
  gradedAssignment: number
  coachUncomfortable: number
  studentCrisis: number
  createdAt: Date
  updatedAt: Date
}
