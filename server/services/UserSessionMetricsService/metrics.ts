import { METRICS } from '../../models/UserSessionMetrics'
import { FEEDBACK_VERSIONS } from '../../constants'

import { MetricData, CounterMetricClass, NO_FLAGS } from './metric-types'
import QueueService from '../QueueService'
import { Jobs } from '../../worker/jobs'

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

  public triggerActions = async () => {
    // Send a warning email to the student about ghosting volunteers the first time the he or she is absent
    if (this.studentValue === 1)
      await QueueService.add(Jobs.EmailStudentAbsentWarning, {
        sessionSubTopic: this.md.session.subTopic,
        sessionDate: this.md.session.createdAt,
        studentId: this.md.session.student,
        volunteerId: this.md.session.volunteer
      })
    // Send an apology email to the volunteer the first time he or she encounters an absent student
    if (this.volunteerValue === 1)
      await QueueService.add(Jobs.EmailVolunteerAbsentStudentApology, {
        sessionSubTopic: this.md.session.subTopic,
        sessionDate: this.md.session.createdAt,
        studentId: this.md.session.student,
        volunteerId: this.md.session.volunteer
      })
  }
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
  public triggerActions = async () => {
    // Send an apology email to the student the first time he or she encounters an absent volunteer
    if (this.studentValue === 1)
      await QueueService.add(Jobs.EmailStudentAbsentVolunteerApology, {
        sessionSubTopic: this.md.session.subTopic,
        sessionDate: this.md.session.createdAt,
        studentId: this.md.session.student,
        volunteerId: this.md.session.volunteer
      })
    // Send a warning email to the volunteer about ghosting students the first time he or she is absent
    if (this.volunteerValue === 1)
      await QueueService.add(Jobs.EmailVolunteerAbsentWarning, {
        sessionSubTopic: this.md.session.subTopic,
        sessionDate: this.md.session.createdAt,
        studentId: this.md.session.student,
        volunteerId: this.md.session.volunteer
      })
  }
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
  public triggerActions = this.noop
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
  public triggerActions = this.noop
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
  public triggerActions = this.noop
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
  public triggerActions = this.noop
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
  public triggerActions = this.noop
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
  public triggerActions = this.noop
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
  public triggerActions = this.noop
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
  public triggerActions = this.noop
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
  public triggerActions = () => {
    // Send an apology email to the student the first time their session is unmatched
    if (this.studentValue === 1)
      QueueService.add(Jobs.EmailStudentUnmatchedApology, {
        sessionSubTopic: this.md.session.subTopic,
        sessionDate: this.md.session.createdAt,
        studentId: this.md.session.student,
        volunteerId: this.md.session.volunteer
      })
  }
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
  public triggerActions = () => {
    // Send an apology email to the student and volunteer when a tech issue is reported in their session
    if (this.updateValue)
      QueueService.add(Jobs.EmailTechIssueApology, {
        studentId: this.md.session.student,
        volunteerId: this.md.session.volunteer
      })
  }
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
