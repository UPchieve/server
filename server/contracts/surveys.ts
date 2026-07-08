import type {
  StudentTutoringFeedback,
  StudentCounselingFeedback,
  VolunteerFeedback,
  ResponseData,
} from '../models/Feedback'
import type { ISODateString } from '../types/dates'
import type { Uuid } from '../types/shared'

// Legacy survey
export type FeedbackPublic = {
  id: Uuid
  sessionId: Uuid
  studentId?: Uuid
  volunteerId?: Uuid
  comment?: string
  // old names for topic/subject for legacy compatibility
  type?: string
  subTopic?: string
  studentTutoringFeedback?: StudentTutoringFeedback
  studentCounselingFeedback?: StudentCounselingFeedback
  volunteerFeedback?: VolunteerFeedback
  // old name for legacy feedback for legacy compatibility
  responseData?: ResponseData
}

export type ResponseDataPublic = {
  'rate-session': { rating: number }
  'session-experience': {
    'easy-to-answer-questions': number
    'feel-like-helped-student': number
    'feel-more-fulfilled': number
    'good-use-of-time': number
    'plan-on-volunteering-again': number
  }
  'other-feedback': string
  'rate-upchieve': {
    'achieve-goal': number
    'easy-to-use': number
    'get-help-faster': number
    'use-next-time': number
  }
  'rate-coach': {
    'achieve-goal': number
    'find-help': number
    knowledgeable: number
    nice: number
    'want-him/her-again': number
  }
  'technical-difficulties': string
  'asked-unprepared-questions': string
  'app-features-needed': string
}

export type StudentTutoringFeedbackPublic = {
  'session-goal'?: number
  'subject-understanding'?: number
  'coach-rating'?: number
  'coach-feedback'?: string
  'other-feedback'?: string
}

export type StudentCounselingFeedbackPublic = {
  'rate-session'?: { rating?: number }
  'session-goal'?: string
  'coach-ratings'?: {
    'coach-knowedgable'?: number
    'coach-friendly'?: number
    'coach-help-again'?: number
  }
  'other-feedback'?: string
}

export type VolunteerFeedbackPublic = {
  'session-enjoyable'?: number
  'session-improvements'?: string
  'student-understanding'?: number
  'session-obstacles'?: number[]
  'other-feedback'?: string
}

export type SimpleSurveyResponsePublic = {
  displayLabel: string
  response: string
  score: number
  displayOrder: number
  questionId: number
  displayImage?: string
  responseId?: number
}

export type PostsessionSurveyResponsePublic = {
  userRole: string
  questionText: string
  displayLabel: string
  response?: string
  displayOrder: number
  score: number
}

export type SurveyResponseDefinitionPublic = {
  responseId?: number
  responseText?: string
  responseDisplayPriority?: number
  responseDisplayImage?: string
}

export type SurveyUserResponseDefinitionPublic = {
  responseId?: number
  response: string
}

export type SurveyQuestionDefinitionPublic = {
  questionId: number
  questionText: string
  displayPriority: number
  questionType: string
  responses: SurveyResponseDefinitionPublic[]
  userResponse?: SurveyUserResponseDefinitionPublic
}

export type SurveyQueryResponsePublic = {
  surveyId: number
  surveyTypeId: number
  survey: SurveyQuestionDefinitionPublic[]
  rewardAmount?: number
}

export type VolunteerContextResponsePublic = {
  totalStudentSessions: number
  responses: SimpleSurveyResponsePublic[]
}

export type PostsessionSurveyGoalResponsePublic = {
  sessionId: string
  roleInSession: string
  submitterUserId: string
  createdAt: ISODateString
  surveyResponseChoiceId: number
  score: number
  choiceText: string
}

export type PresessionGoalResponse = {
  goal: string | undefined
}

export type SurveyDefinitionResponse = {
  survey: SurveyQueryResponsePublic | undefined
}

export type GetSimpleSurveyResponse = {
  survey: SimpleSurveyResponsePublic[]
}
