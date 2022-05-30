import * as SurveyRepo from '../models/Survey'

export async function getPresessionSurvey(
  subjectName: string
): Promise<SurveyRepo.PresessionSurvey> {
  const surveyQuestions = await SurveyRepo.getPresessionSurvey(subjectName)
  return surveyQuestions
}
