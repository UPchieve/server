import FeedbackModel, {
  Feedback,
  FeedbackDocument,
  ResponseData,
  StudentCounselingFeedback,
  StudentTutoringFeedback,
  VolunteerFeedback
} from '../models/Feedback'
import { FEEDBACK_VERSIONS } from '../constants'
import * as SessionService from './SessionService'

export const getFeedback = (query): Promise<Feedback> => {
  return FeedbackModel.findOne(query)
    .lean()
    .exec()
}

export function getFeedbackForSession(sessionId: string): Promise<Feedback[]> {
  return FeedbackModel.find({ sessionId })
    .lean()
    .exec()
}

export const saveFeedback = async (data: {
  sessionId: string
  type: string
  subTopic: string
  responseData?: Partial<ResponseData>
  studentTutoringFeedback?: Partial<StudentTutoringFeedback>
  studentCounselingFeedback?: Partial<StudentCounselingFeedback>
  volunteerFeedback?: Partial<VolunteerFeedback>
  userType: string
  studentId: string
  volunteerId: string
}): Promise<FeedbackDocument> => {
  const feedback = new FeedbackModel({
    ...data,
    versionNumber: FEEDBACK_VERSIONS.TWO
  })
  const {
    sessionId,
    responseData,
    studentTutoringFeedback,
    studentCounselingFeedback,
    volunteerFeedback
  } = data
  const feedbackResponses = {
    ...responseData,
    ...studentTutoringFeedback,
    ...studentCounselingFeedback,
    ...volunteerFeedback
  }
  const flags = await SessionService.getFeedbackFlags(feedbackResponses)
  if (flags.length > 0) await SessionService.updateFlags(sessionId, flags)
  return feedback.save()
}
