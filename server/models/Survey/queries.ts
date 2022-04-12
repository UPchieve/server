import { Types } from 'mongoose'
import SurveyModel, { Survey } from './index'
import { SURVEY_TYPES } from '../../constants'
import { RepoReadError, RepoCreateError } from '../Errors'

export async function savePresessionSurvey(
  userId: Types.ObjectId,
  sessionId: Types.ObjectId,
  responseData: object
): Promise<Survey> {
  try {
    const survey = await SurveyModel.findOneAndUpdate(
      {
        session: sessionId,
        user: userId,
        surveyType: SURVEY_TYPES.STUDENT_PRESESSION,
      },
      {
        session: sessionId,
        user: userId,
        surveyType: SURVEY_TYPES.STUDENT_PRESESSION,
        responseData: responseData,
      },
      { new: true, upsert: true }
    )
      .lean()
      .exec()
    if (!survey) throw new RepoCreateError('Error upserting presession survey')
    return survey as Survey
  } catch (err) {
    throw new RepoCreateError(err)
  }
}

export async function getPresessionSurvey(
  user: Types.ObjectId,
  session: Types.ObjectId,
  surveyType: SURVEY_TYPES
): Promise<Survey | undefined> {
  try {
    const survey = await SurveyModel.findOne({
      session,
      user,
      surveyType,
    })
      .lean()
      .exec()
    if (survey) return survey as Survey
  } catch (err) {
    throw new RepoReadError(err)
  }
}
