import { String } from 'aws-sdk/clients/cloudsearch'
import { Ulid } from '../pgUtils'

const SURVEY_TYPES = <const>['presession', 'postsession']
export type SurveyType = typeof SURVEY_TYPES[number]

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
  sessionId: Ulid
  surveyTypeId: number
  createdAt: Date
  updatedAt: Date
}

export type SaveUserSurvey = Pick<
  UserSurvey,
  'surveyId' | 'sessionId' | 'surveyTypeId'
>

export type UserSurveySubmission = {
  userSurveyId: Ulid
  questionId: number
  responseChoiceId: number
  openResponse: string
  createdAt: Date
  updatedAt: Date
}

export type SaveUserSurveySubmission = Pick<
  UserSurveySubmission,
  'questionId' | 'responseChoiceId' | 'openResponse'
>

export type SurveyResponseDefinition = {
  responseId: number
  responseText: string
  responseDisplayPriority: number
  responseDisplayImage: string | undefined
}

export type SurveyQuestionDefinition = {
  questionId: string
  questionText: string
  displayPriority: number
  questionType: String
  responses: SurveyResponseDefinition[]
}

export type SurveyQueryResponse = {
  surveyId: number
  surveyTypeId: number
  survey: SurveyQuestionDefinition[]
}
