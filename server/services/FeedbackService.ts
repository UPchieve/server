import _ from 'lodash'
import Case from 'case'
import FeedbackModel, {
  Feedback,
  StudentCounselingFeedback,
  StudentTutoringFeedback,
  VolunteerFeedback,
} from '../models/Feedback'
import { FEEDBACK_VERSIONS } from '../constants'
import { FEEDBACK_EVENTS } from '../constants/events'
import { emitter } from './EventsService'
import {
  asString,
  asNumber,
  asFactory,
  asOptional,
  asArray,
} from '../utils/type-utils'

const asStudentTutoringFeedback = asFactory<StudentTutoringFeedback>({
  'session-goal': asNumber,
  'subject-understanding': asNumber,
  'coach-rating': asNumber,
  'coach-feedback': asString,
  'other-feedback': asOptional(asString),
})

// TODO: nested objects can be annoying using asFactory
const asRateSession = asFactory({
  rating: asNumber,
})
const asCoachRating = asFactory({
  'coach-knowedgable': asNumber,
  'coach-friendly': asNumber,
  'coach-help-again': asNumber,
})
const asStudentCounselingFeedback = asFactory<StudentCounselingFeedback>({
  'rate-session': asRateSession,
  'session-goal': asString,
  'coach-ratings': asCoachRating,
  'other-feedback': asOptional(asString),
})

const asVolunteerFeedback = asFactory<VolunteerFeedback>({
  'session-enjoyable': asNumber,
  'session-improvements': asString,
  'student-understanding': asNumber,
  'session-obstacles': asArray(asNumber),
  'other-feedback': asOptional(asString),
})

const asFeedbackPayload = asFactory({
  sessionId: asString,
  type: asString,
  subTopic: asString,
  studentTutoringFeedback: asOptional(asStudentTutoringFeedback),
  studentCounselingFeedback: asOptional(asStudentCounselingFeedback),
  volunteerFeedback: asOptional(asVolunteerFeedback),
  userType: asString,
  studentId: asString,
  volunteerId: asString,
})

export async function saveFeedback(data: unknown): Promise<Feedback> {
  const {
    sessionId,
    type,
    subTopic,
    studentTutoringFeedback,
    studentCounselingFeedback,
    volunteerFeedback,
    userType,
    studentId,
    volunteerId,
  } = asFeedbackPayload(data)
  const feedback = new FeedbackModel({
    sessionId,
    type: Case.camel(type),
    subTopic: Case.camel(subTopic),
    studentTutoringFeedback,
    studentCounselingFeedback,
    volunteerFeedback,
    userType,
    studentId,
    volunteerId,
    versionNumber: FEEDBACK_VERSIONS.TWO,
  })

  const doc = await feedback.save()
  emitter.emit(FEEDBACK_EVENTS.FEEDBACK_SAVED, doc.sessionId, doc._id)
  return doc.toObject()
}
