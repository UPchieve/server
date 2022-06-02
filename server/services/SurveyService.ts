import * as SurveyRepo from '../models/Survey'

export async function getPresessionSurveyNew(
  subjectName: string
): Promise<SurveyRepo.PresessionSurvey[]> {
  const surveyQuestions = await SurveyRepo.getPresessionSurveyNew(subjectName)
  return surveyQuestions
}
