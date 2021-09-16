import { Types } from 'mongoose'

import { MetricType, Counter } from '../../models/UserSessionMetrics'
import { USER_SESSION_METRICS, FEEDBACK_VERSIONS } from '../../constants'
import {
  UpdateValueData,
  ProcessorData,
  CounterMetricProcessor,
  NO_FLAGS
} from './types'

class AbsentStudent extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.absentStudent
  public requiresFeedback = false

  public computeUpdateValue = (uvd: UpdateValueData) => {
    if (uvd.session.volunteerJoinedAt) {
      for (const msg of uvd.session.messages) {
        if (
          (msg.user as Types.ObjectId).equals(
            uvd.session.student as Types.ObjectId
          ) &&
          msg.createdAt > uvd.session.volunteerJoinedAt
        )
          return 0
      }
      return 1
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData<Counter>) =>
    pd.value && this.computeFinalValue(pd.studentUSM, pd.value) >= 4
      ? [this.key]
      : NO_FLAGS
  public computeFlag = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
}

class AbsentVolunteer extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.absentVolunteer
  public requiresFeedback = false

  public computeUpdateValue = (uvd: UpdateValueData) => {
    if (uvd.session.volunteerJoinedAt) {
      for (const msg of uvd.session.messages) {
        if (
          (msg.user as Types.ObjectId).equals(
            uvd.session.volunteer as Types.ObjectId
          ) &&
          msg.createdAt > uvd.session.volunteerJoinedAt
        )
          return 0
      }
      return 1
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData<Counter>) =>
    pd.value && this.computeFinalValue(pd.volunteerUSM, pd.value) >= 2
      ? [this.key]
      : NO_FLAGS
  public computeFlag = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
}

class LowCoachRatingFromStudent extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.lowCoachRatingFromStudent
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    if (uvd.feedback && uvd.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = uvd.feedback
      if (
        feedback.studentTutoringFeedback &&
        feedback.studentTutoringFeedback['coach-rating'] <= 2
      )
        return 1
      else if (feedback.studentCounselingFeedback) {
        for (const value of Object.values(
          feedback.studentCounselingFeedback['coach-ratings']
        )) {
          if (value <= 2) return 1
        }
      }
    }
    return 0
  }
  public computeReviewReason = () => NO_FLAGS
  public computeFlag = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
}

class LowSessionRatingFromStudent extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.lowSessionRatingFromStudent
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    if (uvd.feedback && uvd.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = uvd.feedback
      if (
        feedback.studentTutoringFeedback &&
        feedback.studentTutoringFeedback['session-goal'] <= 2
      )
        return 1
      else if (
        feedback.studentCounselingFeedback &&
        feedback.studentCounselingFeedback['rate-session'].rating <= 2
      )
        return 1
    }
    return 0
  }
  public computeReviewReason = () => NO_FLAGS
  public computeFlag = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
}

class LowSessionRatingFromCoach extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.lowSessionRatingFromCoach
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    if (uvd.feedback && uvd.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = uvd.feedback
      if (
        feedback.volunteerFeedback &&
        feedback.volunteerFeedback['session-enjoyable'] <= 2
      )
        return 1
    }
    return 0
  }
  public computeReviewReason = () => NO_FLAGS
  public computeFlag = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
}

class Reported extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.reported
  public requiresFeedback = false

  public computeUpdateValue = (uvd: UpdateValueData) =>
    uvd.session.isReported ? 1 : 0
  public computeReviewReason = () => [this.key]
  public computeFlag = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
}

class RudeOrInappropriate extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.rudeOrInappropriate
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    if (uvd.feedback && uvd.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = uvd.feedback
      if (feedback.volunteerFeedback) {
        for (const value of Object.values(
          feedback.volunteerFeedback['session-obstacles']
        )) {
          if (value === 6) return 1
        }
      }
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData<Counter>) =>
    pd.value && this.computeFinalValue(pd.studentUSM, pd.value) >= 2
      ? [this.key]
      : NO_FLAGS
  public computeFlag = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
}

class OnlyLookingForAnswers extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.onlyLookingForAnswers
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    if (uvd.feedback && uvd.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = uvd.feedback
      if (feedback.volunteerFeedback) {
        for (const value of Object.values(
          feedback.volunteerFeedback['session-obstacles']
        )) {
          if (value === 7) return 1
        }
      }
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData<Counter>) =>
    pd.value && this.computeFinalValue(pd.studentUSM, pd.value) >= 2
      ? [this.key]
      : NO_FLAGS
  public computeFlag = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
}

class CommentFromStudent extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.commentFromStudent
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    if (uvd.feedback && uvd.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = uvd.feedback.studentTutoringFeedback
        ? uvd.feedback.studentTutoringFeedback
        : uvd.feedback.studentCounselingFeedback
      return feedback['other-feedback'] ? 1 : 0
    }
    return 0
  }
  public computeReviewReason = () => NO_FLAGS
  public computeFlag = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
}

class CommentFromVolunteer extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.commentFromVolunteer
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    if (uvd.feedback && uvd.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      if (uvd.session.volunteer && uvd.feedback.volunteerFeedback)
        return uvd.feedback.volunteerFeedback['other-feedback'] ? 1 : 0
    }
    return 0
  }
  public computeReviewReason = () => NO_FLAGS
  public computeFlag = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
}

class HasBeenUnmatched extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.hasBeenUnmatched
  public requiresFeedback = false

  public computeUpdateValue = (uvd: UpdateValueData) =>
    !uvd.session.volunteer ? 1 : 0
  public computeReviewReason = () => NO_FLAGS
  public computeFlag = () => NO_FLAGS
}

class HasHadTechnicalIssues extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.hasHadTechnicalIssues
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    if (uvd.feedback && uvd.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      if (uvd.feedback.volunteerFeedback) {
        for (const value of Object.values(
          uvd.feedback.volunteerFeedback['session-obstacles']
        )) {
          if (value === 0) return 1
        }
      }
    }
    return 0
  }
  public computeReviewReason = () => NO_FLAGS
  public computeFlag = () => NO_FLAGS
}

// export each metric as a singleton instance
export const METRIC_PROCESSORS = {
  HasBeenUnmatched: new HasBeenUnmatched(),
  AbsentStudent: new AbsentStudent(),
  AbsentVolunteer: new AbsentVolunteer(),
  Reported: new Reported(),
  LowCoachRatingFromStudent: new LowCoachRatingFromStudent(),
  LowSessionRatingFromStudent: new LowSessionRatingFromStudent(),
  LowSessionRatingFromCoach: new LowSessionRatingFromCoach(),
  RudeOrInappropriate: new RudeOrInappropriate(),
  OnlyLookingForAnswers: new OnlyLookingForAnswers(),
  CommentFromStudent: new CommentFromStudent(),
  CommentFromVolunteer: new CommentFromVolunteer(),
  HasHadTechnicalIssues: new HasHadTechnicalIssues()
}

export type MetricProcessorOutputs = {
  [key in keyof typeof METRIC_PROCESSORS]?: MetricType
}
