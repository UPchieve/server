/*
import { Types } from 'mongoose'
import { Session } from '../../../models/Session'
import {
  CurrentSession,
  PublicSession,
  SessionsToReview,
  SessionToEnd,
  StudentLatestSession,
} from '../../../models/Session/queries'
import {
  buildSession,
  buildStudent,
  buildVolunteer,
  getFirstName,
  getObjectId,
} from '../../generate'

export function mockedGetSessionsToReview(overrides = {}): SessionsToReview {
  const session = buildSession()
  return {
    createdAt: session.createdAt,
    endedAt: session.endedAt ? session.endedAt : new Date(),
    totalMessages: session.messages.length,
    type: session.type,
    subTopic: session.subTopic,
    studentFirstName: getFirstName(),
    isReported: session.isReported,
    flags: session.flags,
    reviewReasons: session.reviewReasons,
    ...overrides,
  }
}

export function mockedGetSessionById(overrides = {}): Session {
  const newSession = buildSession()
  return {
    _id: newSession._id,
    student: newSession.student as Types.ObjectId,
    volunteer: newSession.volunteer as Types.ObjectId,
    type: newSession.type,
    subTopic: newSession.subTopic,
    messages: newSession.messages,
    hasWhiteboardDoc: newSession.hasWhiteboardDoc,
    whiteboardDoc: newSession.whiteboardDoc,
    quillDoc: newSession.quillDoc,
    createdAt: newSession.createdAt,
    volunteerJoinedAt: newSession.volunteerJoinedAt,
    failedJoins: newSession.failedJoins,
    endedAt: newSession.endedAt,
    endedBy: newSession.endedBy,
    notifications: newSession.notifications,
    photos: newSession.photos,
    isReported: newSession.isReported,
    reportReason: newSession.reportReason,
    reportMessage: newSession.reportMessage,
    flags: newSession.flags,
    reviewed: newSession.reviewed,
    toReview: newSession.toReview,
    reviewReasons: newSession.reviewReasons,
    timeTutored: newSession.timeTutored,
    ...overrides,
  }
}

export function mockedGetSessionToEnd(overrides = {}): SessionToEnd {
  const session = buildSession()
  const student = buildStudent()
  const volunteer = buildVolunteer()
  return {
    _id: session._id,
    createdAt: session.createdAt,
    endedAt: session.endedAt,
    isReported: session.isReported,
    messages: session.messages,
    type: session.type,
    subTopic: session.subTopic,
    student: {
      _id: student._id,
      firstname: student.firstname,
      email: student.email,
      pastSessions: student.pastSessions,
    },
    volunteer: {
      _id: volunteer._id,
      firstname: volunteer.firstname,
      email: volunteer.email,
      pastSessions: volunteer.pastSessions,
      volunteerPartnerOrg: volunteer.volunteerPartnerOrg,
    },
    volunteerJoinedAt: session.volunteerJoinedAt,
    ...overrides,
  }
}

export function mockedGetAdminFilteredSessions(overrides = {}) {
  const student = buildStudent()
  const volunteer = buildVolunteer()
  return {
    id: getObjectId(),
    createdAt: new Date(),
    endedAt: new Date(),
    volunteer: {
      firstname: volunteer.firstname,
      totalPastSessions: volunteer.pastSessions.length,
    },
    totalMessages: 0,
    type: 'math',
    subTopic: 'prealgebra',
    student: {
      firstname: student.firstname,
      isTestUser: student.isTestUser,
      totalPastSessions: student.pastSessions.length,
    },
    studentFirstName: student.firstname,
    studentRating: 1,
    ...overrides,
  }
}

export function mockedGetSessionByIdWithStudentAndVolunteer(overrides = {}) {
  const student = buildStudent()
  const volunteer = buildVolunteer()

  return {
    ...buildSession(),
    student: {
      _id: student._id,
      isVolunteer: student.isVolunteer,
      firstname: student.firstname,
      pastSessions: student.pastSessions,
      createdAt: student.createdAt,
    },
    volunteer: {
      _id: volunteer._id,
      isVolunteer: volunteer.isVolunteer,
      firstname: volunteer.firstname,
      pastSessions: volunteer.pastSessions,
      createdAt: volunteer.createdAt,
    },
    ...overrides,
  }
}

export function buildUserAgent(overrides = {}) {
  return {
    device: '',
    browser: '',
    browserVersion: '',
    operatingSystem: '',
    operatingSystemVersion: '',
    ...overrides,
  }
}

export function mockedGetSessionRequestedUserAgentFromSessionId(
  overrides = {}
) {
  const student = buildStudent()
  const volunteer = buildVolunteer()
  return {
    ...mockedGetSessionById(),
    student,
    volunteer,
    ...overrides,
  }
}

export function mockedGetFeedbackForSession(overrides = {}) {
  const student = buildStudent()
  const volunteer = buildVolunteer()
  return {
    ...mockedGetSessionById(),
    student,
    volunteer,
    ...overrides,
  }
}

export function mockedGetCurrentSession(overrides = {}) {
  const session = buildSession()
  const student = buildStudent()
  const volunteer = buildVolunteer()
  return {
    ...session,
    student: {
      _id: student._id,
      firstname: student.firstname,
      isVolunteer: student.isVolunteer,
    },
    volunteer: {
      _id: volunteer._id,
      firstname: volunteer.firstname,
      isVolunteer: volunteer.isVolunteer,
    },
    ...overrides,
  } as CurrentSession
}

export function mockedCreateSession(overrides = {}): Session {
  return buildSession(overrides)
}

export function mockedGetStudentLatestSession(
  overrides = {}
): StudentLatestSession {
  const session = buildSession()
  return {
    _id: session._id.toString(),
    createdAt: session.createdAt.toISOString(),
    ...overrides,
  }
}

export function mockedGetPublicSession(overrides = {}): PublicSession {
  const session = buildSession()
  const student = buildStudent()
  const volunteer = buildVolunteer()
  return {
    _id: session._id,
    student: {
      _id: student._id,
      firstname: student.firstname,
    },
    volunteer: {
      _id: volunteer._id,
      firstname: volunteer.firstname,
    },
    subTopic: session.subTopic,
    type: session.type,
    createdAt: session.createdAt,
    endedAt: session.endedAt,
    ...overrides,
  }
}
*/
