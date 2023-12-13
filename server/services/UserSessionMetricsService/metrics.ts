import { SESSION_REPORT_REASON, USER_SESSION_METRICS } from '../../constants'
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
      if (moment(uvd.session.endedAt).isSameOrBefore(volunteerMaxWait)) return 0

      for (const msg of uvd.messages) {
        if (
          msg.user === uvd.session.studentId &&
          // if student sends message after volunteer joined, then don't flag student
          moment(msg.createdAt).isAfter(uvd.session.volunteerJoinedAt)
        )
          return 0
      }
      return 1
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData) =>
    pd.value && this.computeFinalValue(pd.studentUSM, pd.value) >= 4
      ? [this.key]
      : NO_FLAGS
  public computeFlag = (pd: ProcessorData) => (pd.value ? [this.key] : NO_FLAGS)
  public triggerActions = (pd: ProcessorData) => {
    const actions: Promise<any>[] = []
    if (!pd.value) return actions
    // Send a warning email to the student about ghosting volunteers the first time the he or she is absent
    if (this.computeFinalValue(pd.studentUSM, pd.value) === 1)
      actions.push(
        QueueService.add(
          Jobs.EmailStudentAbsentWarning,
          {
            sessionSubtopic: pd.session.subjectDisplayName,
            sessionDate: pd.session.createdAt,
            studentId: pd.session.studentId,
            volunteerId: pd.session.volunteerId,
          },
          {
            removeOnComplete: true,
            removeOnFail: true,
          }
        )
      )

    // Send an apology email to the volunteer the first time he or she encounters an absent student
    if (
      pd.volunteerUSM &&
      this.computeFinalValue(pd.volunteerUSM, pd.value) === 1
    )
      actions.push(
        QueueService.add(
          Jobs.EmailVolunteerAbsentStudentApology,
          {
            sessionSubtopic: pd.session.subjectDisplayName,
            sessionDate: pd.session.createdAt,
            studentId: pd.session.studentId,
            volunteerId: pd.session.volunteerId,
          },
          {
            removeOnComplete: true,
            removeOnFail: true,
          }
        )
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
      if (moment(uvd.session.endedAt).isSameOrBefore(studentMaxWait)) return 0

      for (const msg of uvd.messages) {
        if (
          // if volunteer sends message, then don't flag volunteer
          msg.user === uvd.session.volunteerId
        )
          return 0
      }
      return 1
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData) =>
    pd.value &&
    pd.volunteerUSM &&
    this.computeFinalValue(pd.volunteerUSM, pd.value) >= 2
      ? [this.key]
      : NO_FLAGS
  public computeFlag = (pd: ProcessorData) => (pd.value ? [this.key] : NO_FLAGS)
  public triggerActions = (pd: ProcessorData) => {
    const actions: Promise<any>[] = []
    if (!pd.value) return actions
    // Send a warning email to the volunteer about ghosting students the first time he or she is absent
    if (
      pd.volunteerUSM &&
      this.computeFinalValue(pd.volunteerUSM, pd.value) === 1
    )
      actions.push(
        QueueService.add(
          Jobs.EmailVolunteerAbsentWarning,
          {
            sessionSubtopic: pd.session.subjectDisplayName,
            sessionDate: pd.session.createdAt,
            studentId: pd.session.studentId,
            volunteerId: pd.session.volunteerId,
          },
          {
            removeOnComplete: true,
            removeOnFail: true,
          }
        )
      )

    // Send an apology email to the student the first time he or she encounters an absent volunteer
    if (this.computeFinalValue(pd.studentUSM, pd.value) === 1)
      actions.push(
        QueueService.add(
          Jobs.EmailStudentAbsentVolunteerApology,
          {
            sessionSubtopic: pd.session.subjectDisplayName,
            sessionDate: pd.session.createdAt,
            studentId: pd.session.studentId,
            volunteerId: pd.session.volunteerId,
          },
          {
            removeOnComplete: true,
            removeOnFail: true,
          }
        )
      )

    return actions
  }
}

class LowCoachRatingFromStudent extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.lowCoachRatingFromStudent
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    const coachRatingFromStudent = uvd.surveyResponses?.find(
      resp =>
        resp.questionText === 'Overall, how supportive was your coach today?'
    )?.score
    if (coachRatingFromStudent && coachRatingFromStudent <= 2) {
      return 1
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData) =>
    pd.value ? [this.key] : NO_FLAGS
  public computeFlag = (pd: ProcessorData) => (pd.value ? [this.key] : NO_FLAGS)
  public triggerActions = () => NO_ACTIONS
}

class LowSessionRatingFromStudent extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.lowSessionRatingFromStudent
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    const sessionRatingFromSTudent = uvd.surveyResponses?.find(resp =>
      resp.questionText.endsWith('Did UPchieve help you achieve your goal?')
    )?.score
    if (sessionRatingFromSTudent && sessionRatingFromSTudent <= 2) {
      return 1
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData) =>
    pd.value ? [this.key] : NO_FLAGS
  public computeFlag = (pd: ProcessorData) => (pd.value ? [this.key] : NO_FLAGS)
  public triggerActions = () => NO_ACTIONS
}

class LowSessionRatingFromCoach extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.lowSessionRatingFromCoach
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    const sessionRatingFromCoach = uvd.surveyResponses?.find(resp =>
      resp.questionText.endsWith(
        'Were you able to help them achieve their goal?'
      )
    )?.score
    if (sessionRatingFromCoach && sessionRatingFromCoach <= 2) {
      return 1
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData) =>
    pd.value ? [this.key] : NO_FLAGS
  public computeFlag = (pd: ProcessorData) => (pd.value ? [this.key] : NO_FLAGS)
  public triggerActions = () => NO_ACTIONS
}

class Reported extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.reported
  public requiresFeedback = false

  public computeUpdateValue = (uvd: UpdateValueData) =>
    uvd.session.reported ? 1 : 0
  public computeReviewReason = (pd: ProcessorData) =>
    pd.value ? [this.key] : NO_FLAGS
  public computeFlag = (pd: ProcessorData) => (pd.value ? [this.key] : NO_FLAGS)
  public triggerActions = () => NO_ACTIONS
}

class RudeOrInappropriate extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.rudeOrInappropriate
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    const meanOrInappropriate = uvd.surveyResponses?.find(
      resp => resp.response === 'Student was mean or inappropriate'
    )
    if (meanOrInappropriate) {
      return 1
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData) =>
    pd.value && this.computeFinalValue(pd.studentUSM, pd.value) >= 2
      ? [this.key]
      : NO_FLAGS
  public computeFlag = (pd: ProcessorData) => (pd.value ? [this.key] : NO_FLAGS)
  public triggerActions = () => NO_ACTIONS
}

class OnlyLookingForAnswers extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.onlyLookingForAnswers
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    const onlyLookingForAnswers = uvd.surveyResponses?.find(
      resp =>
        resp.response === 'Student was pressuring me to do their work for them'
    )
    if (onlyLookingForAnswers) {
      return 1
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData) =>
    pd.value && this.computeFinalValue(pd.studentUSM, pd.value) >= 2
      ? [this.key]
      : NO_FLAGS
  public computeFlag = (pd: ProcessorData) => (pd.value ? [this.key] : NO_FLAGS)
  public triggerActions = (pd: ProcessorData) => {
    if (pd.value && this.computeFinalValue(pd.studentUSM, pd.value) === 1)
      return [
        QueueService.add(
          Jobs.EmailStudentOnlyLookingForAnswers,
          {
            sessionSubtopic: pd.session.subjectDisplayName,
            sessionDate: pd.session.createdAt,
            studentId: pd.session.studentId,
            volunteerId: pd.session.volunteerId,
          },
          {
            removeOnComplete: true,
            removeOnFail: true,
          }
        ),
      ] as Promise<any>[]
    else return NO_ACTIONS
  }
}

class CommentFromStudent extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.commentFromStudent
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    const studentComment = uvd.surveyResponses?.find(
      resp =>
        resp.questionText === 'Your thoughts' && resp.userRole === 'student'
    )
    if (studentComment) {
      return 1
    }
    return 0
  }
  public computeReviewReason = () => NO_FLAGS
  public computeFlag = (pd: ProcessorData) => (pd.value ? [this.key] : NO_FLAGS)
  public triggerActions = () => NO_ACTIONS
}

class CommentFromVolunteer extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.commentFromVolunteer
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    const volunteerComment = uvd.surveyResponses?.find(
      resp =>
        resp.questionText === 'Your thoughts' && resp.userRole === 'volunteer'
    )
    if (volunteerComment) {
      return 1
    }
    return 0
  }
  public computeReviewReason = () => NO_FLAGS
  public computeFlag = (pd: ProcessorData) => (pd.value ? [this.key] : NO_FLAGS)
  public triggerActions = () => NO_ACTIONS
}

class HasBeenUnmatched extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.hasBeenUnmatched
  public requiresFeedback = false

  public computeUpdateValue = (uvd: UpdateValueData) =>
    !uvd.session.volunteerId ? 1 : 0
  public computeReviewReason = () => NO_FLAGS
  public computeFlag = () => NO_FLAGS
  public triggerActions = (pd: ProcessorData) => {
    const actions: Promise<any>[] = []
    if (!pd.value) return actions
    // Send an apology email to the student the first time their session is unmatched
    if (this.computeFinalValue(pd.studentUSM, pd.value) === 1)
      actions.push(
        QueueService.add(
          Jobs.EmailStudentUnmatchedApology,
          {
            sessionSubtopic: pd.session.subjectDisplayName,
            sessionDate: pd.session.createdAt,
            studentId: pd.session.studentId,
            volunteerId: pd.session.volunteerId,
          },
          {
            removeOnComplete: true,
            removeOnFail: true,
          }
        )
      )

    return actions
  }
}

class HasHadTechnicalIssues extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.hasHadTechnicalIssues
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    const techIssues = uvd.surveyResponses?.find(
      resp => resp.response === 'Tech issue'
    )
    if (techIssues) {
      return 1
    }
    return 0
  }
  public computeReviewReason = () => NO_FLAGS
  public computeFlag = () => NO_FLAGS
  public triggerActions = () => NO_ACTIONS
}

class PersonalIdentifyingInfo extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.personalIdentifyingInfo
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    const personalInfo = uvd.surveyResponses?.find(
      resp =>
        resp.response ===
        'Student shared their email, last name, or other personally identifiable information'
    )
    if (personalInfo) {
      return 1
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData) =>
    pd.value ? [this.key] : NO_FLAGS
  public computeFlag = (pd: ProcessorData) => (pd.value ? [this.key] : NO_FLAGS)
  public triggerActions = () => NO_ACTIONS
}

class GradedAssignment extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.gradedAssignment
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    const gradedAssignment = uvd.surveyResponses?.find(
      resp => resp.response === 'Student was working on a quiz or exam'
    )
    if (gradedAssignment) {
      return 1
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData) =>
    pd.value ? [this.key] : NO_FLAGS
  public computeFlag = (pd: ProcessorData) => (pd.value ? [this.key] : NO_FLAGS)
  public triggerActions = () => NO_ACTIONS
}

class CoachUncomfortable extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.gradedAssignment
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    const coachUncomfortable = uvd.surveyResponses?.find(
      resp => resp.response === 'Student made me feel uncomfortable'
    )
    if (coachUncomfortable) {
      return 1
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData) =>
    pd.value ? [this.key] : NO_FLAGS
  public computeFlag = (pd: ProcessorData) => (pd.value ? [this.key] : NO_FLAGS)
  public triggerActions = () => NO_ACTIONS
}

class StudentCrisis extends CounterMetricProcessor {
  public key = USER_SESSION_METRICS.studentCrisis
  public requiresFeedback = true

  public computeUpdateValue = (uvd: UpdateValueData) => {
    const studentInCrisis = uvd.surveyResponses?.find(
      resp =>
        resp.response ===
        'Student is in severe emotional distress and/or unsafe'
    )
    if (studentInCrisis) {
      return 1
    }
    return 0
  }
  public computeReviewReason = (pd: ProcessorData) =>
    pd.value ? [this.key] : NO_FLAGS
  public computeFlag = (pd: ProcessorData) => (pd.value ? [this.key] : NO_FLAGS)
  public triggerActions = (pd: ProcessorData) => {
    const actions: Promise<any>[] = []
    if (!pd.value) return actions

    // If session was not reported, follow report workflow for emotiona distress
    if (!pd.session.reported) {
      actions.push(
        QueueService.add(
          Jobs.EmailSessionReported,
          {
            studentId: pd.session.studentId,
            reportReason: SESSION_REPORT_REASON.STUDENT_SAFETY,
            isBanReason: false,
            sessionId: pd.session.id,
          },
          {
            removeOnComplete: true,
            removeOnFail: true,
          }
        )
      )
    }
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
  StudentCrisis: new StudentCrisis(),
  PersonalIdentifyingInfo: new PersonalIdentifyingInfo(),
  GradedAssignment: new GradedAssignment(),
  CoachUncomfortable: new CoachUncomfortable(),
}

export type MetricProcessorOutputs = {
  [key in keyof typeof METRIC_PROCESSORS]?: number
}
