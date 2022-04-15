import _ from 'lodash'
import * as FeedbackRepo from '../models/Feedback'
import { FEEDBACK_EVENTS } from '../constants/events'
import { emitter } from './EventsService'
import {
  asString,
  asNumber,
  asFactory,
  asOptional,
  asArray,
} from '../utils/type-utils'
import { InputError } from '../models/Errors'
import { Ulid } from '../models/pgUtils'

const asStudentTutoringFeedback = asFactory<
  FeedbackRepo.StudentTutoringFeedback
>({
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
const asStudentCounselingFeedback = asFactory<
  FeedbackRepo.StudentCounselingFeedback
>({
  'rate-session': asOptional(asRateSession),
  'session-goal': asOptional(asString),
  'coach-ratings': asOptional(asCoachRating),
  'other-feedback': asOptional(asString),
})

const asVolunteerFeedback = asFactory<FeedbackRepo.VolunteerFeedback>({
  'session-enjoyable': asOptional(asNumber),
  'session-improvements': asOptional(asString),
  'student-understanding': asOptional(asNumber),
  'session-obstacles': asOptional(asArray(asNumber)),
  'other-feedback': asOptional(asString),
})

const asFeedbackPayload = asFactory({
  sessionId: asString,
  studentTutoringFeedback: asOptional(asStudentTutoringFeedback),
  studentCounselingFeedback: asOptional(asStudentCounselingFeedback),
  volunteerFeedback: asOptional(asVolunteerFeedback),
  userType: asString,
})

export async function saveFeedback(data: unknown): Promise<Ulid> {
  const {
    sessionId,
    studentTutoringFeedback,
    studentCounselingFeedback,
    volunteerFeedback,
    userType,
  } = asFeedbackPayload(data)
  if (
    _.isEmpty(studentTutoringFeedback) &&
    _.isEmpty(studentCounselingFeedback) &&
    _.isEmpty(volunteerFeedback)
  )
    throw new InputError('Must answer at least one question')

  if (!(userType === 'student' || userType === 'volunteer'))
    throw new Error('User type unrecognized')

  const feedbackId = await FeedbackRepo.saveFeedback(sessionId, userType, {
    studentTutoringFeedback,
    studentCounselingFeedback,
    volunteerFeedback,
  })
  emitter.emit(FEEDBACK_EVENTS.FEEDBACK_SAVED, sessionId, feedbackId)
  return feedbackId
}
