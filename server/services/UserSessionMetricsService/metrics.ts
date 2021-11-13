import { Types } from 'mongoose'

import { MetricType, Counter } from '../../models/UserSessionMetrics'
import { USER_SESSION_METRICS, FEEDBACK_VERSIONS } from '../../constants'
import QueueService from '../QueueService'
import { Jobs } from '../../worker/jobs'
import {
  UpdateValueData,
  ProcessorData,
  CounterMetricProcessor,
  NO_FLAGS,
  NO_ACTIONS,
} from './types'
import moment from 'moment'

class AbsentStudent extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.absentStudent
  public requiresFeedback = false

  public computeUpdateValue = (uvd: UpdateValueData) => {
    const VOLUNTEER_WAITING_PERIOD_MIN = 10
    if (uvd.session.volunteerJoinedAt) {
      const volunteerMaxWait = moment(uvd.session.volunteerJoinedAt).add(
        VOLUNTEER_WAITING_PERIOD_MIN,
        'minutes'
      )

      // if volunteer waits for less than 10 minutes, do not flag student bc student did not get a chance to respond within wait period
      if (moment(uvd.session.endedAt).isBefore(volunteerMaxWait)) return 0

      for (const msg of uvd.session.messages) {
        if (
          (msg.user as Types.ObjectId).equals(
            uvd.session.student as Types.ObjectId
          ) &&
          // if student sends message within 10 mins of volunteer joining, then don't flag student
          moment(msg.createdAt).isAfter(uvd.session.volunteerJoinedAt) &&
          // Note: if student sends message at the last millisecond of the 10th minute, then don't flag student
          moment(msg.createdAt).isSameOrBefore(volunteerMaxWait)
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
  public triggerActions = (pd: ProcessorData<Counter>) => {
    const actions: Promise<any>[] = []
    if (!pd.value) return actions
    // Send a warning email to the student about ghosting volunteers the first time the he or she is absent
    if (this.computeFinalValue(pd.studentUSM, pd.value) === 1)
      actions.push(
        QueueService.add(Jobs.EmailStudentAbsentWarning, {
          sessionSubtopic: pd.session.subTopic,
          sessionDate: pd.session.createdAt,
          studentId: pd.session.student,
          volunteerId: pd.session.volunteer,
        })
      )

    // Send an apology email to the volunteer the first time he or she encounters an absent student
    if (
      pd.volunteerUSM &&
      this.computeFinalValue(pd.volunteerUSM, pd.value) === 1
    )
      actions.push(
        QueueService.add(Jobs.EmailVolunteerAbsentStudentApology, {
          sessionSubtopic: pd.session.subTopic,
          sessionDate: pd.session.createdAt,
          studentId: pd.session.student,
          volunteerId: pd.session.volunteer,
        })
      )

    return actions
  }
}

class AbsentVolunteer extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.absentVolunteer
  public requiresFeedback = false

  public computeUpdateValue = (uvd: UpdateValueData) => {
    const STUDENT_WAITING_PERIOD_MIN = 5
    if (uvd.session.volunteerJoinedAt) {
      const studentMaxWait = moment(uvd.session.volunteerJoinedAt).add(
        STUDENT_WAITING_PERIOD_MIN,
        'minutes'
      )

      //if student waits for less than 5 minutes, then not flag volunteer
      if (moment(uvd.session.endedAt).isBefore(studentMaxWait)) return 0

      for (const msg of uvd.session.messages) {
        if (
          (msg.user as Types.ObjectId).equals(
            uvd.session.volunteer as Types.ObjectId
          ) &&
          // if volunteer sends message within 5 mins of student joining, then don't flag volunteer
          moment(msg.createdAt).isAfter(uvd.session.volunteerJoinedAt) &&
          // Note: if volunteer sends message at the last millisecond of the 5th minute, then don't flag student
          moment(msg.createdAt).isSameOrBefore(studentMaxWait)
        )
          return 0
      }
      return 1
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData<Counter>) =>
    pd.value &&
    pd.volunteerUSM &&
    this.computeFinalValue(pd.volunteerUSM, pd.value) >= 2
      ? [this.key]
      : NO_FLAGS
  public computeFlag = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
  public triggerActions = (pd: ProcessorData<Counter>) => {
    const actions: Promise<any>[] = []
    if (!pd.value) return actions
    // Send a warning email to the volunteer about ghosting students the first time he or she is absent
    if (
      pd.volunteerUSM &&
      this.computeFinalValue(pd.volunteerUSM, pd.value) === 1
    )
      actions.push(
        QueueService.add(Jobs.EmailVolunteerAbsentWarning, {
          sessionSubtopic: pd.session.subTopic,
          sessionDate: pd.session.createdAt,
          studentId: pd.session.student,
          volunteerId: pd.session.volunteer,
        })
      )

    // Send an apology email to the student the first time he or she encounters an absent volunteer
    if (this.computeFinalValue(pd.studentUSM, pd.value) === 1)
      actions.push(
        QueueService.add(Jobs.EmailStudentAbsentVolunteerApology, {
          sessionSubtopic: pd.session.subTopic,
          sessionDate: pd.session.createdAt,
          studentId: pd.session.student,
          volunteerId: pd.session.volunteer,
        })
      )

    return actions
  }
}

class LowCoachRatingFromStudent extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.lowCoachRatingFromStudent
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    if (uvd.feedback && uvd.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = uvd.feedback
      if (
        feedback.studentTutoringFeedback &&
        feedback.studentTutoringFeedback['coach-rating']! <= 2
      )
        return 1
      else if (
        feedback.studentCounselingFeedback &&
        feedback.studentCounselingFeedback['coach-ratings']
      ) {
        for (const value of Object.values(
          feedback.studentCounselingFeedback['coach-ratings']
        )) {
          if (value <= 2) return 1
        }
      }
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
  public computeFlag = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
  public triggerActions = () => NO_ACTIONS
}

class LowSessionRatingFromStudent extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.lowSessionRatingFromStudent
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    if (uvd.feedback && uvd.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = uvd.feedback
      if (
        feedback.studentTutoringFeedback &&
        feedback.studentTutoringFeedback['session-goal']! <= 2
      )
        return 1
      else if (
        feedback.studentCounselingFeedback &&
        feedback.studentCounselingFeedback['rate-session'] &&
        feedback.studentCounselingFeedback['rate-session'].rating! <= 2
      )
        return 1
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
  public computeFlag = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
  public triggerActions = () => NO_ACTIONS
}

class LowSessionRatingFromCoach extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.lowSessionRatingFromCoach
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    if (uvd.feedback && uvd.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = uvd.feedback
      if (
        feedback.volunteerFeedback &&
        feedback.volunteerFeedback['session-enjoyable']! <= 2
      )
        return 1
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
  public computeFlag = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
  public triggerActions = () => NO_ACTIONS
}

class Reported extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.reported
  public requiresFeedback = false

  public computeUpdateValue = (uvd: UpdateValueData) =>
    uvd.session.isReported ? 1 : 0
  public computeReviewReason = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
  public computeFlag = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
  public triggerActions = () => NO_ACTIONS
}

class RudeOrInappropriate extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.rudeOrInappropriate
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    if (uvd.feedback && uvd.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = uvd.feedback
      if (
        feedback.volunteerFeedback &&
        feedback.volunteerFeedback['session-obstacles']
      ) {
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
  public triggerActions = () => NO_ACTIONS
}

class OnlyLookingForAnswers extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.onlyLookingForAnswers
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    if (uvd.feedback && uvd.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = uvd.feedback
      if (
        feedback.volunteerFeedback &&
        feedback.volunteerFeedback['session-obstacles']
      ) {
        for (const value of Object.values(
          feedback.volunteerFeedback['session-obstacles']
        )) {
          if (value === 8) return 1
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
  public triggerActions = (pd: ProcessorData<Counter>) => {
    if (pd.value && this.computeFinalValue(pd.studentUSM, pd.value) === 1)
      return [
        QueueService.add(Jobs.EmailStudentOnlyLookingForAnswers, {
          sessionSubtopic: pd.session.subTopic,
          sessionDate: pd.session.createdAt,
          studentId: pd.session.student,
          volunteerId: pd.session.volunteer,
        }),
      ] as Promise<any>[]
    else return NO_ACTIONS
  }
}

class CommentFromStudent extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.commentFromStudent
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    if (uvd.feedback && uvd.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      const feedback = uvd.feedback.studentTutoringFeedback
        ? uvd.feedback.studentTutoringFeedback
        : uvd.feedback.studentCounselingFeedback
      return feedback && feedback['other-feedback'] ? 1 : 0
    }
    return 0
  }
  public computeReviewReason = () => NO_FLAGS
  public computeFlag = (pd: ProcessorData<Counter>) =>
    pd.value ? [this.key] : NO_FLAGS
  public triggerActions = () => NO_ACTIONS
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
  public triggerActions = () => NO_ACTIONS
}

class HasBeenUnmatched extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.hasBeenUnmatched
  public requiresFeedback = false

  public computeUpdateValue = (uvd: UpdateValueData) =>
    !uvd.session.volunteer ? 1 : 0
  public computeReviewReason = () => NO_FLAGS
  public computeFlag = () => NO_FLAGS
  public triggerActions = (pd: ProcessorData<Counter>) => {
    const actions: Promise<any>[] = []
    if (!pd.value) return actions
    // Send an apology email to the student the first time their session is unmatched
    if (this.computeFinalValue(pd.studentUSM, pd.value) === 1)
      actions.push(
        QueueService.add(Jobs.EmailStudentUnmatchedApology, {
          sessionSubtopic: pd.session.subTopic,
          sessionDate: pd.session.createdAt,
          studentId: pd.session.student,
          volunteerId: pd.session.volunteer,
        })
      )

    return actions
  }
}

class HasHadTechnicalIssues extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.hasHadTechnicalIssues
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    if (uvd.feedback && uvd.feedback.versionNumber === FEEDBACK_VERSIONS.TWO) {
      if (
        uvd.feedback.volunteerFeedback &&
        uvd.feedback.volunteerFeedback['session-obstacles']
      ) {
        for (const value of Object.values(
          uvd.feedback.volunteerFeedback['session-obstacles']
        )) {
          if (value === 1) return 1
        }
      }
    }
    return 0
  }
  public computeReviewReason = () => NO_FLAGS
  public computeFlag = () => NO_FLAGS
  public triggerActions = (pd: ProcessorData<Counter>) => {
    const actions: Promise<any>[] = []
    // Send an apology email to the student and volunteer when a tech issue is reported in their session
    if (pd.value)
      actions.push(
        QueueService.add(Jobs.EmailTechIssueApology, {
          studentId: pd.session.student,
          volunteerId: pd.session.volunteer,
        })
      )

    return actions
  }
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
  HasHadTechnicalIssues: new HasHadTechnicalIssues(),
}

export type MetricProcessorOutputs = {
  [key in keyof typeof METRIC_PROCESSORS]?: MetricType
}
