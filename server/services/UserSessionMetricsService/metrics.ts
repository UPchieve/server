import { METRICS } from '../../models/UserSessionMetrics'
import { FEEDBACK_VERSIONS } from '../../constants'

import { MetricData, CounterMetricClass, NO_FLAGS } from './metric-types'

export class AbsentStudent extends CounterMetricClass {
  public key = METRICS.absentStudent

  constructor(md: MetricData) {
    super(md)
    this.setup()
  }

  public computeUpdateValue = () => {
    if (this.md.session.volunteerJoinedAt) {
      for (const msg of this.md.session.messages) {
        if (
          msg.user === this.md.session.student &&
          msg.createdAt > this.md.session.volunteerJoinedAt
        )
          return 0
      }
      return 1
    }
    return 0
  }
  public review = () => this.studentValue >= 4
  public flag = () => (this.updateValue ? [this.key] : ([] as string[]))
}

export class AbsentVolunteer extends CounterMetricClass {
  public key = METRICS.absentVolunteer

  constructor(md: MetricData) {
    super(md)
    this.setup()
  }

  public computeUpdateValue = () => {
    if (this.md.session.volunteerJoinedAt) {
      for (const msg of this.md.session.messages) {
        if (
          msg.user === this.md.session.volunteer &&
          msg.createdAt > this.md.session.volunteerJoinedAt
        )
          return 0
      }
      return 1
    }
    return 0
  }
  public review = () => this.volunteerValue >= 2
  public flag = () => (this.updateValue ? [this.key] : ([] as string[]))
}

export class LowCoachRatingFromStudent extends CounterMetricClass {
  public key = METRICS.lowCoachRatingFromStudent

  constructor(md: MetricData) {
    super(md)
    this.setup()
  }

  public computeUpdateValue = () => {
    if (
      this.md.feedback &&
      this.md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO
    ) {
      const feedback = this.md.feedback
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
  public review = () => false
  public flag = () => (this.updateValue ? [this.key] : ([] as string[]))
}

export class LowSessionRatingFromStudent extends CounterMetricClass {
  public key = METRICS.lowSessionRatingFromStudent

  constructor(md: MetricData) {
    super(md)
    this.setup()
  }

  public computeUpdateValue = () => {
    if (
      this.md.feedback &&
      this.md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO
    ) {
      const feedback = this.md.feedback
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
  public review = () => false
  public flag = () => (this.updateValue ? [this.key] : ([] as string[]))
}

export class LowSessionRatingFromCoach extends CounterMetricClass {
  public key = METRICS.lowSessionRatingFromCoach

  constructor(md: MetricData) {
    super(md)
    this.setup()
  }

  public computeUpdateValue = () => {
    if (
      this.md.feedback &&
      this.md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO
    ) {
      const feedback = this.md.feedback
      if (
        feedback.volunteerFeedback &&
        feedback.volunteerFeedback['session-enjoyable'] <= 2
      )
        return 1
    }
    return 0
  }
  public review = () => false
  public flag = () => (this.updateValue ? [this.key] : ([] as string[]))
}

export class Reported extends CounterMetricClass {
  public key = METRICS.reported

  constructor(md: MetricData) {
    super(md)
    this.setup()
  }

  public computeUpdateValue = () => (this.md.session.isReported ? 1 : 0)
  public review = () => true
  public flag = () => (this.updateValue ? [this.key] : ([] as string[]))
}

export class RudeOrInappropriate extends CounterMetricClass {
  public key = METRICS.rudeOrInappropriate

  constructor(md: MetricData) {
    super(md)
    this.setup()
  }

  public computeUpdateValue = () => {
    if (
      this.md.feedback &&
      this.md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO
    ) {
      const feedback = this.md.feedback
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
  public review = () => this.studentValue >= 2
  public flag = () => (this.updateValue ? [this.key] : ([] as string[]))
}

export class OnlyLookingForAnswers extends CounterMetricClass {
  public key = METRICS.onlyLookingForAnswers

  constructor(md: MetricData) {
    super(md)
    this.setup()
  }

  public computeUpdateValue = () => {
    if (
      this.md.feedback &&
      this.md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO
    ) {
      const feedback = this.md.feedback
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
  public review = () => this.studentValue >= 2
  public flag = () => (this.updateValue ? [this.key] : ([] as string[]))
}

export class CommentFromStudent extends CounterMetricClass {
  public key = METRICS.commentFromStudent

  constructor(md: MetricData) {
    super(md)
    this.setup()
  }

  public computeUpdateValue = () => {
    if (
      this.md.feedback &&
      this.md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO
    ) {
      const feedback = this.md.feedback.studentTutoringFeedback
        ? this.md.feedback.studentTutoringFeedback
        : this.md.feedback.studentCounselingFeedback
      return feedback['other-feedback'] ? 1 : 0
    }
    return 0
  }
  public review = () => false
  public flag = () => (this.updateValue ? [this.key] : ([] as string[]))
}

export class CommentFromVolunteer extends CounterMetricClass {
  public key = METRICS.commentFromVolunteer

  constructor(md: MetricData) {
    super(md)
    this.setup()
  }

  public computeUpdateValue = () => {
    if (
      this.md.feedback &&
      this.md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO
    ) {
      if (this.md.session.volunteer && this.md.feedback.volunteerFeedback)
        return this.md.feedback.volunteerFeedback['other-feedback'] ? 1 : 0
    }
    return 0
  }
  public review = () => false
  public flag = () => (this.updateValue ? [this.key] : ([] as string[]))
}

export class HasBeenUnmatched extends CounterMetricClass {
  public key = METRICS.hasBeenUnmatched

  constructor(md: MetricData) {
    super(md)
    this.setup()
  }

  public computeUpdateValue = () => (!this.md.session.volunteer ? 1 : 0)
  public review = () => false
  public flag = () => NO_FLAGS
}

export class HasHadTechnicalIssues extends CounterMetricClass {
  public key = METRICS.hasHadTechnicalIssues

  constructor(md: MetricData) {
    super(md)
    this.setup()
  }

  public computeUpdateValue = () => {
    if (
      this.md.feedback &&
      this.md.feedback.versionNumber === FEEDBACK_VERSIONS.TWO
    ) {
      if (this.md.feedback.volunteerFeedback) {
        for (const value of Object.values(
          this.md.feedback.volunteerFeedback['session-obstacles']
        )) {
          if (value === 0) return 1
        }
      }
    }
    return 0
  }
  public review = () => false
  public flag = () => NO_FLAGS
}

export const METRICS_CLASSES = [
  AbsentStudent,
  AbsentVolunteer,
  LowCoachRatingFromStudent,
  LowSessionRatingFromStudent,
  LowSessionRatingFromCoach,
  Reported,
  RudeOrInappropriate,
  OnlyLookingForAnswers,
  CommentFromStudent,
  CommentFromVolunteer,
  HasBeenUnmatched,
  HasHadTechnicalIssues
]
