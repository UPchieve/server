import { Ulid } from '../pgUtils'

export type ResponseData = {
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

export type StudentTutoringFeedback = {
  'session-goal'?: number
  'subject-understanding'?: number
  'coach-rating'?: number
  'coach-feedback'?: string
  'other-feedback'?: string
}

export type StudentCounselingFeedback = {
  'rate-session'?: { rating?: number }
  'session-goal'?: string
  'coach-ratings'?: {
    'coach-knowedgable'?: number
    'coach-friendly'?: number
    'coach-help-again'?: number
  }
  'other-feedback'?: string
}

export type VolunteerFeedback = {
  'session-enjoyable'?: number
  'session-improvements'?: string
  'student-understanding'?: number
  'session-obstacles'?: number[]
  'other-feedback'?: string
}

export type Feedback = {
  id: Ulid
  sessionId: Ulid
  studentId?: Ulid
  volunteerId?: Ulid
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
