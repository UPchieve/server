import { Ulid } from '../pgUtils'

const SURVEY_TYPES = <const>[
  'presession',
  'postsession',
  'progress-report',
  'impact-study',
]
export type SurveyType = (typeof SURVEY_TYPES)[number]

export type PresessionSurveyResponseData = {
  'primary-goal': {
    answer: string
    other?: string
  }
  'topic-understanding': {
    answer: number
  }
}

export type LegacySurvey = {
  id: Ulid
  userId: Ulid
  sessionId: Ulid
  responseData: PresessionSurveyResponseData
  createdAt: Date
  updatedAt: Date
}

export type UserSurvey = {
  id: Ulid
  surveyId: number
  userId: Ulid
  sessionId?: Ulid
  progressReportId?: Ulid
  surveyTypeId: number
  createdAt: Date
  updatedAt: Date
}

export type SaveUserSurvey = Pick<
  UserSurvey,
  'surveyId' | 'sessionId' | 'surveyTypeId' | 'progressReportId'
>

export type UserSurveySubmission = {
  userSurveyId: Ulid
  questionId: number
  responseChoiceId?: number
  openResponse: string
  createdAt: Date
  updatedAt: Date
}

export type SaveUserSurveySubmission = Pick<
  UserSurveySubmission,
  'questionId' | 'responseChoiceId' | 'openResponse'
>

// TODO: Refactor the `SimpleSurveyResponse` type into this type to consolidate
// the retrieval of both possible responses and user responses for a survey question
export type SurveyResponseDefinition = {
  responseId?: number
  responseText?: string
  responseDisplayPriority?: number
  responseDisplayImage?: string
}

export type SurveryUserResponseDefinition = {
  responseId?: number
  response: string
}

export type SurveyQuestionDefinition = {
  questionId: number
  questionText: string
  displayPriority: number
  questionType: string
  responses: SurveyResponseDefinition[]
  // TODO: Refactor in favor of `SurveyResponseDefinition` after `SimpleSurveyResponse`
  // is refactored into `SurveyResponseDefinition` type
  userResponse?: SurveryUserResponseDefinition
}

export type SurveyQueryResponse = {
  surveyId: number
  surveyTypeId: number
  survey: SurveyQuestionDefinition[]
  rewardAmount?: number
}

export type PostsessionSurveyGoalResponse = {
  sessionId: string
  createdAt: Date
  surveyResponseChoiceId: number
  score: number
  choiceText: string
}
