import { Types } from 'mongoose'

import {
  METRICS,
  incrementCounterByUserId,
} from '../../models/UserSessionMetrics'
import { Session, updateFlags } from '../../models/Session'
import { FeedbackVersionTwo } from '../../models/Feedback'
import { FEEDBACK_VERSIONS } from '../../constants'

export type Counter = number
const TRUE = 1 as Counter
const FALSE = 0 as Counter

export type Label = String
// type TRUE = String
// const FALSE = '' as Label

export interface MetricData {
  user: Types.ObjectId
  session: Session // a completed session
  feedback?: FeedbackVersionTwo // prepopulate the feedback
}

export interface SessionMetric<T> {
  key: string
  path: string // TODO: couple path to generic Type (Counter, Label, etc)
  getUpdateValue(md: MetricData): T // TODO: couple value calculation to update execution
  update(md: MetricData, val?: T): Promise<void>
  review(val: T): boolean
}

export const ABSENT_STUDENT: SessionMetric<Counter> = {
  key: METRICS.absentStudent,
  path: 'counters',
  getUpdateValue: md => {
    if (md.session.volunteerJoinedAt) {
      for (const msg of md.session.messages) {
        if (
          (msg.user as Types.ObjectId).equals(md.session.student as Types.ObjectId) &&
          msg.createdAt > md.session.volunteerJoinedAt
        )
          return FALSE
      }
      return TRUE
    }
    return FALSE
  },
  update: async function(md) {
    await incrementCounterByUserId(
      md.session.student as Types.ObjectId,
      METRICS.absentStudent
    )
    if (md.session.volunteer)
      await incrementCounterByUserId(
        md.session.volunteer as Types.ObjectId,
        METRICS.absentStudent
      )
    await updateFlags(md.session._id, [METRICS.absentStudent])
  },
  review: val => val >= 4
}

export const ABSENT_VOLUNTEER: SessionMetric<Counter> = {
  key: METRICS.absentVolunteer,
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
    await incrementCounterByUserId(
      md.session.student as Types.ObjectId,
      METRICS.absentVolunteer
    )
    if (md.session.volunteer)
      await incrementCounterByUserId(
        md.session.volunteer as Types.ObjectId,
        METRICS.absentVolunteer
      )
    await updateFlags(md.session._id, [METRICS.absentVolunteer])
  },
  review: val => val >= 2
}

export const LOW_COACH_RATING_FROM_STUDENT: SessionMetric<Counter> = {
  key: METRICS.lowCoachRatingFromStudent,
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

export const COMMENT_FROM_STUDENT: SessionMetric<Counter> = {
  key: METRICS.commentFromStudent,
  path: 'counters',
  getUpdateValue: md => {
    if (md.feedback && md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = md.feedback.studentTutoringFeedback
        ? md.feedback.studentTutoringFeedback
        : md.feedback.studentCounselingFeedback
      return feedback['other-feedback'] ? TRUE : FALSE
    }
    return FALSE
  },
  update: async md => {
    await incrementCounterByUserId(md.user, METRICS.commentFromStudent)
    await updateFlags(md.session._id, [METRICS.commentFromStudent])
  },
  review: () => false
}

export const COMMENT_FROM_VOLUNTEER: SessionMetric<Counter> = {
  key: METRICS.commentFromVolunteer,
  path: 'counters',
  getUpdateValue: md => {
    if (md.feedback && md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      if (md.session.volunteer && md.feedback.volunteerFeedback)
        return md.feedback.volunteerFeedback['other-feedback'] ? TRUE : FALSE
    }
    return FALSE
  },
  update: async md => {
    await incrementCounterByUserId(md.user, METRICS.commentFromVolunteer)
    await updateFlags(md.session._id, [METRICS.commentFromVolunteer])
  },
  review: () => false
}

export const HAS_BEEN_UNMATCHED: SessionMetric<Counter> = {
  key: METRICS.hasBeenUnmatched,
  path: 'counters',
  getUpdateValue: md => (!md.session.volunteer ? TRUE : FALSE),
  update: async md => {
    await incrementCounterByUserId(md.user, METRICS.hasBeenUnmatched)
  },
  review: () => false
}

export const HAS_HAD_TECHNICAL_ISSUES: SessionMetric<Counter> = {
  key: METRICS.hasHadTechnicalIssues,
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

export const METRIC_PROCESSORS = [
  ABSENT_STUDENT,
  ABSENT_VOLUNTEER,
  LOW_COACH_RATING_FROM_STUDENT,
  LOW_SESSION_RATING_FROM_STUDENT,
  LOW_SESSION_RATING_FROM_COACH,
  REPORTED,
  RUDE_OR_INAPPROPRIATE,
  ONLY_LOOKING_FOR_ANSWERS,
  COMMENT_FROM_STUDENT,
  COMMENT_FROM_VOLUNTEER,
  HAS_BEEN_UNMATCHED,
  HAS_HAD_TECHNICAL_ISSUES
]
