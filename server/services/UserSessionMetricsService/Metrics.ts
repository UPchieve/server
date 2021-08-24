import { Types } from 'mongoose'

import {
  METRICS,
  incrementCounterByUserId
} from '../../models/UserSessionMetrics'
import { Session, updateFlags } from '../../models/Session'
import { Student } from '../../models/Student'
import { Volunteer } from '../../models/Volunteer'
import { FeedbackVersionTwo } from '../../models/Feedback'
import { FEEDBACK_VERSIONS } from '../../constants'

export type Counter = number
const TRUE = 1 as Counter
const FALSE = 0 as Counter
// export type Label = String

export interface MetricData {
  user: Types.ObjectId
  session: Session // a completed session
  student: Student // prepopulate the student
  volunteer?: Volunteer // prepopulate the volunteer
  feedback?: FeedbackVersionTwo // prepopulate the feedback
}

export interface SessionMetric<T> {
  key: string
  path: string  // TODO: couple path to generic Type
  needsFeedback: boolean
  getUpdateValue(md: MetricData): T
  update(md: MetricData, val?: T): Promise<void>
  review(val: T): boolean
}

export const ABSENT_STUDENT: SessionMetric<Counter> = {
  key: METRICS.absentStudent,
  needsFeedback: false,
  path: 'counters',
  getUpdateValue: md => {
    if (md.session.volunteerJoinedAt) {
      for (const msg of md.session.messages) {
        if (
          msg.user === md.session.student &&
          msg.createdAt > md.session.volunteerJoinedAt
        )
          return FALSE
      }
      return TRUE
    }
    return FALSE
  },
  update: async function(md) {
    await incrementCounterByUserId(md.user, METRICS.absentStudent)
    await updateFlags(md.session._id, [METRICS.absentStudent])
  },
  review: val => val >= 4
}

export const ABSENT_VOLUNTEER: SessionMetric<Counter> = {
  key: METRICS.absentVolunteer,
  needsFeedback: false,
  path: 'counters',
  getUpdateValue: md => {
    if (md.session.volunteerJoinedAt) {
      for (const msg of md.session.messages) {
        if (
          msg.user === md.session.volunteer &&
          msg.createdAt > md.session.volunteerJoinedAt
        )
          return FALSE
      }
      return TRUE
    }
    return FALSE
  },
  update: async md => {
    await incrementCounterByUserId(md.user, METRICS.absentVolunteer)
    await updateFlags(md.session._id, [METRICS.absentVolunteer])
  },
  review: val => val >= 2
}

export const LOW_COACH_RATING_FROM_STUDENT: SessionMetric<Counter> = {
  key: METRICS.lowCoachRatingFromStudent,
  needsFeedback: true,
  path: 'counters',
  getUpdateValue: md => {
    if (md.feedback && md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = md.feedback
      if (
        feedback.studentTutoringFeedback &&
        feedback.studentTutoringFeedback['coach-rating'] <= 2
      )
        return TRUE
      else if (feedback.studentCounselingFeedback) {
        for (const value of Object.values(
          feedback.studentCounselingFeedback['coach-ratings']
        )) {
          if (value <= 2) return TRUE
        }
      }
    }
    return FALSE
  },
  update: async md => {
    await incrementCounterByUserId(md.user, METRICS.lowCoachRatingFromStudent)
    await updateFlags(md.session._id, [METRICS.lowCoachRatingFromStudent])
  },
  review: () => false
}

export const LOW_SESSION_RATING_FROM_STUDENT: SessionMetric<Counter> = {
  key: METRICS.lowSessionRatingFromStudent,
  needsFeedback: true,
  path: 'counters',
  getUpdateValue: md => {
    if (md.feedback && md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = md.feedback
      if (
        feedback.studentTutoringFeedback &&
        feedback.studentTutoringFeedback['session-goal'] <= 2
      )
        return TRUE
      else if (
        feedback.studentCounselingFeedback &&
        feedback.studentCounselingFeedback['rate-session'].rating <= 2
      )
        return TRUE
    }
    return FALSE
  },
  update: async md => {
    await incrementCounterByUserId(md.user, METRICS.lowSessionRatingFromStudent)
    await updateFlags(md.session._id, [METRICS.lowSessionRatingFromStudent])
  },
  review: () => false
}

export const LOW_SESSION_RATING_FROM_COACH: SessionMetric<Counter> = {
  key: METRICS.lowSessionRatingFromCoach,
  needsFeedback: true,
  path: 'counters',
  getUpdateValue: md => {
    if (md.feedback && md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = md.feedback
      if (
        feedback.volunteerFeedback &&
        feedback.volunteerFeedback['session-enjoyable'] <= 2
      )
        return TRUE
    }
    return FALSE
  },
  update: async md => {
    await incrementCounterByUserId(md.user, METRICS.lowSessionRatingFromCoach)
    await updateFlags(md.session._id, [METRICS.lowSessionRatingFromCoach])
  },
  review: () => false
}

export const REPORTED: SessionMetric<Counter> = {
  key: METRICS.reported,
  needsFeedback: false,
  path: 'counters',
  getUpdateValue: md => (md.session.isReported ? TRUE : FALSE),
  update: async md => {
    await incrementCounterByUserId(md.user, METRICS.reported)
    await updateFlags(md.session._id, [METRICS.reported])
  },
  review: () => true
}

export const RUDE_OR_INAPPROPRIATE: SessionMetric<Counter> = {
  key: METRICS.rudeOrInappropriate,
  needsFeedback: true,
  path: 'counters',
  getUpdateValue: md => {
    if (md.feedback && md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = md.feedback
      if (feedback.volunteerFeedback) {
        for (const value of Object.values(
          feedback.volunteerFeedback['session-obstacles']
        )) {
          if (value === 6) return TRUE
        }
      }
    }
    return FALSE
  },
  update: async md => {
    await incrementCounterByUserId(md.user, METRICS.rudeOrInappropriate)
    await updateFlags(md.session._id, [METRICS.rudeOrInappropriate])
  },
  review: val => val >= 2
}

export const ONLY_LOOKING_FOR_ANSWERS: SessionMetric<Counter> = {
  key: METRICS.onlyLookingForAnswers,
  needsFeedback: true,
  path: 'counters',
  getUpdateValue: md => {
    if (md.feedback && md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = md.feedback
      if (feedback.volunteerFeedback) {
        for (const value of Object.values(
          feedback.volunteerFeedback['session-obstacles']
        )) {
          if (value === 7) return TRUE
        }
      }
    }
    return FALSE
  },
  update: async md => {
    await incrementCounterByUserId(md.user, METRICS.onlyLookingForAnswers)
    await updateFlags(md.session._id, [METRICS.onlyLookingForAnswers])
  },
  review: val => val >= 2
}

export const COMMENTS: SessionMetric<Counter> = {
  key: METRICS.comments,
  needsFeedback: true,
  path: 'counters',
  getUpdateValue: md => {
    if (md.feedback && md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      let feedback
      if (md.user === md.session.student)
        if (md.feedback.studentTutoringFeedback)
          feedback = md.feedback.studentTutoringFeedback
        else if (md.feedback.studentCounselingFeedback)
          feedback = md.feedback.studentCounselingFeedback
        else if (md.session.volunteer && md.user === md.session.volunteer)
          if (md.feedback.volunteerFeedback)
            feedback = md.feedback.volunteerFeedback
          else return FALSE
      return feedback['other-feedback'] ? TRUE : FALSE
    }
    return FALSE
  },
  update: async md => {
    await incrementCounterByUserId(md.user, METRICS.comments)
    await updateFlags(md.session._id, [METRICS.comments])
  },
  review: () => false
}

export const HAS_BEEN_UNMATCHED: SessionMetric<Counter> = {
  key: METRICS.hasBeenUnmatched,
  needsFeedback: false,
  path: 'counters',
  getUpdateValue: md =>
    md.session.student === md.user && !md.session.volunteer ? TRUE : FALSE,
  update: async md => {
    await incrementCounterByUserId(md.user, METRICS.hasBeenUnmatched)
  },
  review: () => false
}

export const HAS_HAD_TECHNICAL_ISSUES: SessionMetric<Counter> = {
  key: METRICS.hasHadTechnicalIssues,
  needsFeedback: true,
  path: 'counters',
  getUpdateValue: md => {
    if (md.feedback && md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = md.feedback
      if (feedback.volunteerFeedback) {
        for (const value of Object.values(
          feedback.volunteerFeedback['session-obstacles']
        )) {
          if (value === 0) return TRUE
        }
      }
    }
    return FALSE
  },
  update: async md => {
    await incrementCounterByUserId(md.user, METRICS.hasHadTechnicalIssues)
  },
  review: () => false
}

export const METRIC_PROCESSORS = [HAS_BEEN_UNMATCHED, HAS_HAD_TECHNICAL_ISSUES]
