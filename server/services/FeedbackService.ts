import _ from 'lodash'
import FeedbackModel, {
  Feedback,
  ResponseData,
  StudentCounselingFeedback,
  StudentTutoringFeedback,
  VolunteerFeedback,
} from '../models/Feedback'
import { FEEDBACK_VERSIONS } from '../constants'
import { FEEDBACK_EVENTS } from '../constants/events'
import { emitter } from './EventsService'

export async function saveFeedback(data: {
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
}): Promise<Feedback> {
  if (
    !_.isEmpty(data.studentTutoringFeedback) &&
    !_.isEmpty(data.studentCounselingFeedback) &&
    !_.isEmpty(data.volunteerFeedback)
  )
    throw new Error('Missing any type of feedback data to save')
  // TODO: repo pattern
  const feedback = new FeedbackModel({
    ...data,
    versionNumber: FEEDBACK_VERSIONS.TWO,
  })

  const doc = await feedback.save()
  emitter.emit(FEEDBACK_EVENTS.FEEDBACK_SAVED, doc.sessionId, doc._id)
  return doc.toObject()
}
