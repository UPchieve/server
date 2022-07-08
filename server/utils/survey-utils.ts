import { SaveUserSurvey, SaveUserSurveySubmission } from '../models/Survey'
import { asArray, asFactory, asNumber, asString } from './type-utils'

export const asSurveySubmissions = asFactory<SaveUserSurveySubmission>({
  questionId: asNumber,
  responseChoiceId: asNumber,
  openResponse: asString,
})

export type SaveSurveyAndSubmissions = SaveUserSurvey & {
  submissions: SaveUserSurveySubmission[]
}

export const asSaveUserSurveyAndSubmissions = asFactory<
  SaveSurveyAndSubmissions
>({
  surveyId: asNumber,
  sessionId: asString,
  surveyTypeId: asNumber,
  submissions: asArray(asSurveySubmissions),
})
