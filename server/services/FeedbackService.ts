import FeedbackModel, {
  Feedback,
  FeedbackDocument,
  ResponseData,
  StudentCounselingFeedback,
  StudentTutoringFeedback,
  VolunteerFeedback,
  FeedbackVersionOne,
  FeedbackVersionTwo
} from '../models/Feedback'
import { FEEDBACK_VERSIONS } from '../constants'
import { FEEDBACK_EVENTS } from '../constants/events'
import { emitter } from './EventsService'

export const getFeedback = (
  query
): Promise<Feedback | FeedbackVersionOne | FeedbackVersionTwo> => {
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

  const doc = await feedback.save()
  emitter.emit(FEEDBACK_EVENTS.FEEDBACK_SAVED, doc.sessionId, doc.userType)
  return doc
}
