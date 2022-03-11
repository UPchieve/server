import _ from 'lodash'
import Case from 'case'
import {
  Feedback,
  StudentCounselingFeedback,
  StudentTutoringFeedback,
  VolunteerFeedback,
} from '../models/Feedback'
import * as FeedbackRepo from '../models/Feedback/queries'
import { FEEDBACK_VERSIONS } from '../constants'
import { FEEDBACK_EVENTS } from '../constants/events'
import { emitter } from './EventsService'
import {
  asString,
  asNumber,
  asFactory,
  asOptional,
  asArray,
  asObjectId,
} from '../utils/type-utils'
import { InputError } from '../models/Errors'

const asStudentTutoringFeedback = asFactory<StudentTutoringFeedback>({
  'session-goal': asOptional(asNumber),
  'subject-understanding': asOptional(asNumber),
  'coach-rating': asOptional(asNumber),
  'coach-feedback': asOptional(asString),
  'other-feedback': asOptional(asString),
})

// TODO: nested objects can be annoying using asFactory
const asRateSession = asFactory({
  rating: asOptional(asNumber),
})
const asCoachRating = asFactory({
  'coach-knowedgable': asOptional(asNumber),
  'coach-friendly': asOptional(asNumber),
  'coach-help-again': asOptional(asNumber),
})
const asStudentCounselingFeedback = asFactory<StudentCounselingFeedback>({
  'rate-session': asOptional(asRateSession),
  'session-goal': asOptional(asString),
  'coach-ratings': asOptional(asCoachRating),
  'other-feedback': asOptional(asString),
})

const asVolunteerFeedback = asFactory<VolunteerFeedback>({
  'session-enjoyable': asOptional(asNumber),
  'session-improvements': asOptional(asString),
  'student-understanding': asOptional(asNumber),
  'session-obstacles': asOptional(asArray(asNumber)),
  'other-feedback': asOptional(asString),
})

const asFeedbackPayload = asFactory({
  sessionId: asObjectId,
  topic: asString,
  subTopic: asString,
  studentTutoringFeedback: asOptional(asStudentTutoringFeedback),
  studentCounselingFeedback: asOptional(asStudentCounselingFeedback),
  volunteerFeedback: asOptional(asVolunteerFeedback),
  userType: asString,
  studentId: asObjectId,
  volunteerId: asObjectId,
})

export async function saveFeedback(data: unknown): Promise<Feedback> {
  const {
    sessionId,
    topic,
    subTopic,
    studentTutoringFeedback,
    studentCounselingFeedback,
    volunteerFeedback,
    userType,
    studentId,
    volunteerId,
  } = asFeedbackPayload(data)
  if (
    _.isEmpty(studentTutoringFeedback) &&
    _.isEmpty(studentCounselingFeedback) &&
    _.isEmpty(volunteerFeedback)
  )
    throw new InputError('Must answer at least one question')

  const doc = await FeedbackRepo.saveFeedback(sessionId, userType, {
    sessionId,
    type: Case.camel(topic),
    subTopic: Case.camel(subTopic),
    studentTutoringFeedback,
    studentCounselingFeedback,
    volunteerFeedback,
    userType,
    studentId,
    volunteerId,
    versionNumber: FEEDBACK_VERSIONS.TWO,
  })
  emitter.emit(FEEDBACK_EVENTS.FEEDBACK_SAVED, doc.sessionId, doc._id)
  return doc
}
