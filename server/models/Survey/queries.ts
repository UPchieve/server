import { Types } from 'mongoose'
import SurveyModel, { Survey } from './index'
import { SURVEY_TYPES } from '../../constants'
import { RepoReadError, RepoCreateError } from '../Errors'

export async function savePresessionSurvey(
  userId: Types.ObjectId | string,
  sessionId: string,
  responseData: object
): Promise<Survey> {
  try {
    const survey = await SurveyModel.create({
      session: sessionId,
      user: userId,
      surveyType: SURVEY_TYPES.STUDENT_PRESESSION,
      responseData: responseData,
    })
    return survey.toObject() as Survey
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getPresessionSurvey(
  session: Types.ObjectId | string,
  user: Types.ObjectId | string,
  surveyType: SURVEY_TYPES
): Promise<Survey | undefined> {
  try {
    const survey = await SurveyModel.findOne(
      {
        session,
        user,
        surveyType
      }
    ).lean().exec()
    if (survey) return survey as Survey
  } catch (err) {
    throw new RepoReadError(err)
  }
}
