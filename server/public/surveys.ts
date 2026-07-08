import {
  FeedbackPublic,
  PostsessionSurveyGoalResponsePublic,
  PostsessionSurveyResponsePublic,
  ResponseDataPublic,
  SimpleSurveyResponsePublic,
  StudentCounselingFeedbackPublic,
  StudentTutoringFeedbackPublic,
  SurveyQueryResponsePublic,
  SurveyQuestionDefinitionPublic,
  SurveyResponseDefinitionPublic,
  SurveyUserResponseDefinitionPublic,
  VolunteerContextResponsePublic,
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
  LegacySurvey,
  PostsessionSurveyGoalResponse,
  PostsessionSurveyResponse,
  SimpleSurveyResponse,
  SurveyUserResponseDefinition,
  SurveyQueryResponse,
  SurveyQuestionDefinition,
  SurveyResponseDefinition,
  UserSurvey,
  UserSurveySubmission,
} from '../models/Survey'
import { VolunteerContextResponse } from '../services/SurveyService'

function toResponsePublicData(data: ResponseData): ResponseDataPublic {
  const sessionExperience = data['session-experience']
  const rateUpchieve = data['rate-upchieve']
  const rateCoach = data['rate-coach']

  return {
    'rate-session': {
      rating: data['rate-session'].rating,
    },
    'session-experience': {
      'easy-to-answer-questions': sessionExperience['easy-to-answer-questions'],
      'feel-like-helped-student': sessionExperience['feel-like-helped-student'],
      'feel-more-fulfilled': sessionExperience['feel-more-fulfilled'],
      'good-use-of-time': sessionExperience['good-use-of-time'],
      'plan-on-volunteering-again':
        sessionExperience['plan-on-volunteering-again'],
    },
    'other-feedback': data['other-feedback'],
    'rate-upchieve': {
      'achieve-goal': rateUpchieve['achieve-goal'],
      'easy-to-use': rateUpchieve['easy-to-use'],
      'get-help-faster': rateUpchieve['get-help-faster'],
      'use-next-time': rateUpchieve['use-next-time'],
    },
    'rate-coach': {
      'achieve-goal': rateCoach['achieve-goal'],
      'find-help': rateCoach['find-help'],
      knowledgeable: rateCoach.knowledgeable,
      nice: rateCoach.nice,
      'want-him/her-again': rateCoach['want-him/her-again'],
    },
    'technical-difficulties': data['technical-difficulties'],
    'asked-unprepared-questions': data['asked-unprepared-questions'],
    'app-features-needed': data['app-features-needed'],
  }
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

function toStudentCounselingFeedbackPublic(
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

function toSurveyResponseDefinitionPublic(
  response: SurveyResponseDefinition
): SurveyResponseDefinitionPublic {
  return {
    responseId: response.responseId,
    responseText: response.responseText,
    responseDisplayPriority: response.responseDisplayPriority,
    responseDisplayImage: response.responseDisplayImage,
  }
}

function toSurveyUserResponseDefinitionPublic(
  response: SurveyUserResponseDefinition
): SurveyUserResponseDefinitionPublic {
  return {
    responseId: response.responseId,
    response: response.response,
  }
}

function toSurveyQuestionDefinitionPublic(
  question: SurveyQuestionDefinition
): SurveyQuestionDefinitionPublic {
  return {
    questionId: question.questionId,
    questionText: question.questionText,
    displayPriority: question.displayPriority,
    questionType: question.questionType,
    responses: question.responses.map(toSurveyResponseDefinitionPublic),
    userResponse: question.userResponse
      ? toSurveyUserResponseDefinitionPublic(question.userResponse)
      : undefined,
  }
}

export function toSurveyQueryResponsePublic(
  survey: SurveyQueryResponse
): SurveyQueryResponsePublic {
  return {
    surveyId: survey.surveyId,
    surveyTypeId: survey.surveyTypeId,
    survey: survey.survey.map(toSurveyQuestionDefinitionPublic),
    rewardAmount: survey.rewardAmount,
  }
}

export function toVolunteerContextResponsePublic(
  response: VolunteerContextResponse
): VolunteerContextResponsePublic {
  return {
    totalStudentSessions: response.totalStudentSessions,
    responses: response.responses.map(toSimpleSurveyResponsePublic),
  }
}

export function toPostsessionSurveyGoalResponsePublic(
  response: PostsessionSurveyGoalResponse
): PostsessionSurveyGoalResponsePublic {
  return {
    sessionId: response.sessionId,
    roleInSession: response.roleInSession,
    submitterUserId: response.submitterUserId,
    createdAt: response.createdAt.toISOString(),
    surveyResponseChoiceId: response.surveyResponseChoiceId,
    score: response.score,
    choiceText: response.choiceText,
  }
}
