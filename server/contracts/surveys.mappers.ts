import {
  FeedbackPublic,
  PostsessionSurveyResponsePublic,
  ResponseDataPublic,
  SimpleSurveyResponsePublic,
  StudentCounselingFeedbackPublic,
  StudentTutoringFeedbackPublic,
  VolunteerFeedbackPublic,
} from '../contracts/surveys'
import {
  Feedback,
  ResponseData,
  StudentCounselingFeedback,
  StudentTutoringFeedback,
  VolunteerFeedback,
} from '../models/Feedback'
import {
  PostsessionSurveyResponse,
  SimpleSurveyResponse,
} from '../models/Survey'

function toResponsePublicData(data: ResponseData): ResponseDataPublic {
  // Older surveys have different keys; keep their saved responses intact.
  return { ...data }
}

function toStudentTutoringFeedbackPublic(
  feedback: StudentTutoringFeedback
): StudentTutoringFeedbackPublic {
  return {
    'session-goal': feedback['session-goal'],
    'subject-understanding': feedback['subject-understanding'],
    'coach-rating': feedback['coach-rating'],
    'coach-feedback': feedback['coach-feedback'],
    'other-feedback': feedback['other-feedback'],
  }
}

export function toStudentCounselingFeedbackPublic(
  feedback: StudentCounselingFeedback
): StudentCounselingFeedbackPublic {
  const rateSession = feedback['rate-session']
  const coachRatings = feedback['coach-ratings']
  return {
    'rate-session': rateSession
      ? {
          rating: rateSession.rating,
        }
      : undefined,
    'session-goal': feedback['session-goal'],
    'coach-ratings': coachRatings
      ? {
          'coach-knowedgable': coachRatings['coach-knowedgable'],
          'coach-friendly': coachRatings['coach-friendly'],
          'coach-help-again': coachRatings['coach-help-again'],
        }
      : undefined,
    'other-feedback': feedback['other-feedback'],
  }
}

function toVolunteerFeedbackPublic(
  feedback: VolunteerFeedback
): VolunteerFeedbackPublic {
  return {
    'session-enjoyable': feedback['session-enjoyable'],
    'session-improvements': feedback['session-improvements'],
    'student-understanding': feedback['student-understanding'],
    'session-obstacles': feedback['session-obstacles'],
    'other-feedback': feedback['other-feedback'],
  }
}

export function toFeedbackPublic(feedback: Feedback): FeedbackPublic {
  return {
    id: feedback.id,
    sessionId: feedback.sessionId,
    studentId: feedback.studentId,
    volunteerId: feedback.volunteerId,
    comment: feedback.comment,
    type: feedback.type,
    subTopic: feedback.subTopic,
    studentTutoringFeedback: feedback.studentTutoringFeedback
      ? toStudentTutoringFeedbackPublic(feedback.studentTutoringFeedback)
      : undefined,
    studentCounselingFeedback: feedback.studentCounselingFeedback
      ? toStudentCounselingFeedbackPublic(feedback.studentCounselingFeedback)
      : undefined,
    volunteerFeedback: feedback.volunteerFeedback
      ? toVolunteerFeedbackPublic(feedback.volunteerFeedback)
      : undefined,
    responseData: feedback.responseData
      ? toResponsePublicData(feedback.responseData)
      : undefined,
  }
}

export function toSimpleSurveyResponsePublic(
  survey: SimpleSurveyResponse
): SimpleSurveyResponsePublic {
  return {
    displayLabel: survey.displayLabel,
    response: survey.response,
    score: survey.score,
    displayOrder: survey.displayOrder,
    questionId: survey.questionId,
    displayImage: survey.displayImage,
    responseId: survey.responseId,
  }
}

export function toPostsessionSurveyResponsePublic(
  survey: PostsessionSurveyResponse
): PostsessionSurveyResponsePublic {
  return {
    userRole: survey.userRole,
    questionText: survey.questionText,
    displayLabel: survey.displayLabel,
    response: survey.response,
    displayOrder: survey.displayOrder,
    score: survey.score,
  }
}
