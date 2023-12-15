test.todo('postgres migration')
/*import mongoose from 'mongoose'
import SessionModel, { Session } from '../../models/Session'
import * as SessionRepo from '../../models/Session/queries'
import {
  getSession,
  insertSession,
  insertSessionWithVolunteer,
} from '../db-utils'
import {
  DocCreationError,
  DocUpdateError,
  LookupError,
} from '../../models/Errors'
import {
  buildMessage,
  buildNotification,
  getObjectId,
  getStringObjectId,
} from '../generate'
import {
  USER_SESSION_METRICS,
  SESSION_REPORT_REASON,
  SUBJECTS,
  SUBJECT_TYPES,
} from '../../constants'
import VolunteerModel, { Volunteer } from '../../models/Volunteer'
import StudentModel, { Student } from '../../models/Student'

// TODO: create tests for the error cases where a Repo error was thrown

const getStartDate = (): Date => new Date(new Date().getTime() - 1000 * 60 * 10)
const getEndDate = (): Date => new Date(new Date())

async function cleanup() {
  await SessionModel.deleteMany({})
  await StudentModel.deleteMany({})
  await VolunteerModel.deleteMany({})
}

beforeAll(async () => {
  await mongoose.connect(global.__MONGO_URI__)
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('createSession', () => {
  afterAll(async () => {
    await cleanup()
  })

  test('Should create a session', async () => {
    const newSession = {
      studentId: getObjectId(),
      type: SUBJECT_TYPES.MATH,
      subTopic: SUBJECTS.ALGEBRA_ONE,
    }

    const result = await SessionRepo.createSession(newSession)
    const expected = {
      type: newSession.type,
      subTopic: newSession.subTopic,
      student: newSession.studentId,
    }
    expect(result._id).toBeDefined()
    expect(result).toMatchObject(expected)
  })
})

describe('addSessionNotifications', () => {
  let session: Session

  beforeAll(async () => {
    const insertedSession = await insertSession()
    session = insertedSession.session
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should add notification to session', async () => {
    expect(session.notifications).toHaveLength(0)
    const notifications = [
      buildNotification({
        volunteer: getObjectId(),
      }),
      buildNotification({
        volunteer: getObjectId(),
      }),
    ]
    await SessionRepo.addSessionNotifications(session._id, notifications)
    const updatedSession = await getSession(
      { _id: session._id },
      { notifications: 1 }
    )
    expect(updatedSession.notifications).toHaveLength(2)
  })
})

describe('getUnfulfilledSessions', () => {
  test.todo('getUnfulfilledSessions tests')
})

describe('getSessionById', () => {
  let session: Session

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should get session by id', async () => {
    const result = await SessionRepo.getSessionById(session._id)
    // built session has quill doc but we purposefully do not include quill doc in select
    const expected = Object.assign({}, session)
    delete expected.quillDoc

    expect(result).toEqual(expected)
  })

  test('Should throw error if no session is found', async () => {
    await expect(
      SessionRepo.getSessionById(getObjectId())
    ).rejects.toBeInstanceOf(LookupError)
  })
})

describe('updateSessionFlagsById', () => {
  let session: Session

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should update flags', async () => {
    const flags = [
      USER_SESSION_METRICS.absentStudent,
      USER_SESSION_METRICS.commentFromVolunteer,
    ]
    await SessionRepo.updateSessionFlagsById(session._id, flags)

    const updatedSession = await getSession({ _id: session._id }, { flags: 1 })
    expect(updatedSession.flags).toHaveLength(2)
    expect(updatedSession.flags).toEqual(flags)
  })
})

describe('updateSessionReviewReasonsById', () => {
  let session: Session

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should update reviewReasons', async () => {
    const reviewReasons = [
      USER_SESSION_METRICS.absentStudent,
      USER_SESSION_METRICS.commentFromVolunteer,
    ]
    await SessionRepo.updateSessionReviewReasonsById(session._id, reviewReasons)

    const updatedSession = await getSession(
      { _id: session._id },
      { reviewReasons: 1 }
    )
    expect(updatedSession.reviewReasons).toHaveLength(2)
    expect(updatedSession.reviewReasons).toEqual(reviewReasons)
  })
})

describe('updateSessionFailedJoinsById', () => {
  let session: Session

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should update failed joins', async () => {
    const userId = getObjectId()
    await SessionRepo.updateSessionFailedJoinsById(session._id, userId)

    const updatedSession = await getSession(
      { _id: session._id },
      { failedJoins: 1 }
    )

    expect(updatedSession!.failedJoins![0]).toEqual(userId)
  })
})

describe('updateSessionReviewedStatusById', () => {
  let session: Session

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should update reviewed and toReview', async () => {
    await SessionRepo.updateSessionReviewedStatusById(session._id, {
      toReview: false,
      reviewed: true,
    })
    const updatedSession = await getSession(
      { _id: session._id },
      { reviewed: 1, toReview: 1 }
    )
    expect(updatedSession.reviewed).toBeTruthy()
    expect(updatedSession.toReview).toBeFalsy()
  })
})

describe('getSessionToEndById', () => {
  afterAll(async () => {
    await cleanup()
  })

  test('Should get an unmatched session that is ending', async () => {
    const { session, student } = await insertSession()
    const result = await SessionRepo.getSessionToEndById(session._id)
    const expected = {
      _id: session._id,
      createdAt: session.createdAt,
      isReported: session.isReported,
      messages: session.messages,
      type: session.type,
      student: {
        _id: student._id,
        firstname: student.firstname,
        email: student.email,
        pastSessions: student.pastSessions,
      },
    }
    expect(result._id).toBeDefined()
    expect(result).toMatchObject(expected)
  })

  test('Should get a matched session that is ending', async () => {
    const { session, student, volunteer } = await insertSessionWithVolunteer()
    const result = await SessionRepo.getSessionToEndById(session._id)
    const expected = {
      _id: session._id,
      createdAt: session.createdAt,
      isReported: session.isReported,
      messages: session.messages,
      type: session.type,
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
      },
      volunteerJoinedAt: session.volunteerJoinedAt,
    }
    expect(result._id).toBeDefined()
    expect(result).toMatchObject(expected)
  })

  test('Should throw error when no session is found', async () => {
    await expect(
      SessionRepo.getSessionToEndById(getObjectId())
    ).rejects.toBeInstanceOf(LookupError)
  })
})

describe('getSessionsToReview', () => {
  test.todo('Should get sessions to review')
})

describe('getTotalTimeTutoredForDateRange', () => {
  afterAll(async () => {
    await cleanup()
  })

  test('Should get total time tutored for date range', async () => {
    const { volunteer } = await insertSessionWithVolunteer({
      timeTutored: 10000,
    })
    await insertSession({
      volunteer: volunteer._id,
      timeTutored: 5000,
    })

    const result = await SessionRepo.getTotalTimeTutoredForDateRange(
      volunteer._id,
      getStartDate(),
      getEndDate()
    )
    const expected = [
      {
        _id: null,
        timeTutored: 15000,
      },
    ]
    expect(result).toEqual(expected)
  })
})

describe('getActiveSessionsWithVolunteers', () => {
  afterAll(async () => {
    await cleanup()
  })

  test('Should get all matched sessions that have not ended', async () => {
    const { session, volunteer } = await insertSessionWithVolunteer({
      endedAt: undefined,
    })
    const result = await SessionRepo.getActiveSessionsWithVolunteers()
    const expected = [
      {
        _id: session._id,
        volunteer: volunteer._id,
      },
    ]
    expect(result).toEqual(expected)
  })

  test.todo('Should throw error')
})

describe('updateSessionReported', () => {
  let session: Session

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
  })

  afterAll(async () => {
    await cleanup()
  })

  const report = {
    reportReason: SESSION_REPORT_REASON.STUDENT_RUDE,
    reportMessage: 'made a your mom joke',
  }

  test('Should report a session', async () => {
    await SessionRepo.updateSessionReported(session._id, report)
    const updatedSession = await getSession(
      { _id: session._id },
      { isReported: 1, reportReason: 1, reportMessage: 1 }
    )
    expect(updatedSession.isReported).toBeTruthy()
    expect(updatedSession.reportReason).toBe(report.reportReason)
    expect(updatedSession.reportMessage).toBe(report.reportMessage)
  })
})

describe('updateSessionToEnd', () => {
  afterAll(async () => {
    await cleanup()
  })

  test('Should end a session', async () => {
    const { session, student } = await insertSession()
    const data = {
      endedAt: new Date(),
      endedBy: student._id,
    }
    await SessionRepo.updateSessionToEnd(session._id, data)
    const updatedSession = await getSession(
      { _id: session._id },
      {
        endedAt: 1,
        endedBy: 1,
      }
    )

    const expected = {
      _id: session._id,
      ...data,
    }
    expect(updatedSession).toEqual(expected)
  })
})

describe('getLongRunningSessions', () => {
  beforeAll(async () => {
    await insertSessionWithVolunteer()
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should get long running sessions', async () => {
    const startDate = getStartDate().getTime()
    const endDate = getEndDate().getTime()

    const results = await SessionRepo.getLongRunningSessions(
      getStartDate(),
      getEndDate()
    )
    for (const doc of results) {
      expect(doc.endedAt).toBeFalsy()
      const createdAt = doc.createdAt.getTime()
      expect(createdAt).toBeGreaterThanOrEqual(startDate)
      expect(createdAt).toBeLessThan(endDate)
    }
  })
})

describe('updateSessionPhotoKey', () => {
  const photoKey = '12345'
  let session: Session

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should add photo key to photos', async () => {
    await SessionRepo.updateSessionPhotoKey(session._id, photoKey)
    const updatedSession = await getSession(
      { _id: session._id },
      {
        photos: 1,
      }
    )
    expect(updatedSession.photos).toContain(photoKey)
  })
})

describe('getPublicSessionById', () => {
  let session: Session
  let student: Student
  let volunteer: Volunteer

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
    student = insertedSession.student
    volunteer = insertedSession.volunteer
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should get a public session', async () => {
    const result = await SessionRepo.getPublicSessionById(session._id)
    const expected = {
      _id: session._id,
      createdAt: session.createdAt,
      endedAt: session.endedAt,
      type: session.type,
      subTopic: session.subTopic,
      student: {
        _id: student._id,
        firstName: student.firstname,
      },
      volunteer: {
        _id: volunteer._id,
        firstName: volunteer.firstname,
      },
    }

    expect(result).toEqual(expected)
  })
})

describe('getAdminFilteredSessions', () => {
  test.todo('Should get filtered sessions')
})

describe('getSessionByIdWithStudentAndVolunteer', () => {
  afterAll(async () => {
    await cleanup()
  })

  test('Should get session by id with student and volunteer data a session', async () => {
    const { session, student, volunteer } = await insertSessionWithVolunteer()
    const result = await SessionRepo.getSessionByIdWithStudentAndVolunteer(
      session._id
    )
    const expected = {
      _id: session._id,
      createdAt: session.createdAt,
      type: session.type,
      subTopic: session.subTopic,
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
      messages: session.messages,
      hasWhiteboardDoc: session.hasWhiteboardDoc,
      quillDoc: session.quillDoc,
      volunteerJoinedAt: session.volunteerJoinedAt,
      failedJoins: session.failedJoins,
      notifications: session.notifications,
      photos: session.photos,
      isReported: session.isReported,
      flags: session.flags,
      reviewed: session.reviewed,
      toReview: session.toReview,
      reviewReasons: session.reviewReasons,
      timeTutored: session.timeTutored,
    }

    expect(result).toMatchObject(expected)
  })
})

describe('getCurrentSessionById', () => {
  afterAll(async () => {
    await cleanup()
  })

  test('Should get the current session for the given userId', async () => {
    const { session, student, volunteer } = await insertSessionWithVolunteer({
      endedAt: undefined,
    })
    const result = await SessionRepo.getCurrentSessionById(volunteer._id)
    const expected = {
      _id: session._id,
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
      subTopic: session.subTopic,
      type: session.type,
      messages: session.messages,
      createdAt: session.createdAt,
      volunteerJoinedAt: session.volunteerJoinedAt,
    }

    expect(result).toMatchObject(expected)
  })
})

describe('getLatestSessionByStudentId', () => {
  let session: Session
  let student: Student

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
    student = insertedSession.student
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should get the latest session for the given studentId', async () => {
    const result = await SessionRepo.getLatestSessionByStudentId(student._id)
    const expected = {
      _id: session._id,
      createdAt: session.createdAt.toISOString(),
    }

    expect(result).toEqual(expected)
  })
})

describe('updateSessionVolunteerById', () => {
  test('Should add volunteer the session', async () => {
    const { session } = await insertSession()
    const volunteer = getObjectId()
    await SessionRepo.updateSessionVolunteerById(session._id, volunteer)
    const updatedSession = await getSession(
      { _id: session._id },
      {
        volunteer: 1,
        volunteerJoinedAt: 1,
      }
    )
    expect(updatedSession.volunteerJoinedAt).toBeTruthy()
    expect(updatedSession.volunteer).toEqual(volunteer)
  })
})

describe('addMessageToSessionById', () => {
  let session: Session
  let student: Student

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
    student = insertedSession.student
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should add message to messages', async () => {
    const message = buildMessage({
      user: student._id,
    })
    await SessionRepo.addMessageToSessionById(session._id, message)
    const updatedSession = await getSession(
      { _id: session._id },
      {
        messages: 1,
      }
    )
    expect(updatedSession.messages).toHaveLength(1)
  })
})

describe('getSessionsWithAvgWaitTimePerDayAndHour', () => {
  const lastMonday = new Date('2021-01-04T00:00:00.000Z')
  const lastSunday = new Date('2021-01-10T23:59:59.999Z')
  // wait time of 5 minutes for matched session
  const firstSessionData = {
    createdAt: new Date('2021-01-07T10:00:00.000Z'),
    endedAt: new Date('2021-01-07T10:30:00.000Z'),
    volunteerJoinedAt: new Date('2021-01-07T10:05:00.000Z'),
  }
  // wait time of 15 minutes for unmatched session
  const secondSessionData = {
    createdAt: new Date('2021-01-07T10:15:00.000Z'),
    endedAt: new Date('2021-01-07T10:30:00.000Z'),
  }

  beforeAll(async () => {
    await insertSessionWithVolunteer(firstSessionData)
    await insertSession(secondSessionData)
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should add message to messages', async () => {
    const fiveMinutes = 1000 * 60 * 5
    const fifteenMinutes = 1000 * 60 * 15
    const expectedAverageWaitTimeForHour = (fiveMinutes + fifteenMinutes) / 2
    const sessions = await SessionRepo.getSessionsWithAvgWaitTimePerDayAndHour(
      lastMonday,
      lastSunday
    )
    expect(sessions[0].averageWaitTime).toBe(expectedAverageWaitTimeForHour)
  })
})

describe('updateSessionTimeTutored', () => {
  test('Should update related session metrics to the session', async () => {
    const { session } = await insertSession()
    const timeTutored = 1000 * 60 * 20
    await SessionRepo.updateSessionTimeTutored(session._id, timeTutored)
    const updatedSession = await getSession(
      { _id: session._id },
      {
        timeTutored: 1,
      }
    )
    expect(updatedSession.timeTutored).toBe(timeTutored)
  })

  test('Should throw error when database update errors', async () => {
    const mockedSessionUpdateOne = jest.spyOn(SessionModel, 'updateOne')
    const testError = new Error('Test error')
    mockedSessionUpdateOne.mockRejectedValueOnce(testError)

    const sessionId = getObjectId()
    const timeTutored = 1000 * 60 * 20
    await expect(
      async () =>
        await SessionRepo.updateSessionTimeTutored(sessionId, timeTutored)
    ).rejects.toThrow(DocUpdateError)
  })
})

describe('updateSessionQuillDoc', () => {
  test('Should set the quillDoc on the session document', async () => {
    const { session } = await insertSession()
    const quillDoc = { ops: [] }

    await SessionRepo.updateSessionQuillDoc(
      session._id,
      JSON.stringify(quillDoc)
    )
    const updatedSession = await getSession(
      { _id: session._id },
      {
        quillDoc: 1,
      }
    )
    expect(JSON.parse(updatedSession.quillDoc!)).toEqual(quillDoc)
  })

  test('Should throw error when database update errors', async () => {
    const mockedSessionUpdateOne = jest.spyOn(SessionModel, 'updateOne')
    const testError = new Error('Test error')
    mockedSessionUpdateOne.mockRejectedValueOnce(testError)

    const sessionId = getObjectId()
    const quillDoc = { ops: [] }

    await expect(
      async () =>
        await SessionRepo.updateSessionQuillDoc(
          sessionId,
          JSON.stringify(quillDoc)
        )
    ).rejects.toThrow(DocUpdateError)
  })
})

describe('updateSessionHasWhiteboardDoc', () => {
  test('Should set hasWhiteboardDoc on the session document', async () => {
    const { session } = await insertSession()
    const hasWhiteboardDoc = true

    await SessionRepo.updateSessionHasWhiteboardDoc(
      session._id,
      hasWhiteboardDoc
    )
    const updatedSession = await getSession(
      { _id: session._id },
      {
        hasWhiteboardDoc: 1,
      }
    )
    expect(updatedSession.hasWhiteboardDoc).toBeTruthy()
  })

  test('Should throw error when database update errors', async () => {
    const mockedSessionUpdateOne = jest.spyOn(SessionModel, 'updateOne')
    const testError = new Error('Test error')
    mockedSessionUpdateOne.mockRejectedValueOnce(testError)

    const sessionId = getObjectId()
    const hasWhiteboardDoc = false

    await expect(
      async () =>
        await SessionRepo.updateSessionHasWhiteboardDoc(
          sessionId,
          hasWhiteboardDoc
        )
    ).rejects.toThrow(DocUpdateError)
  })
})

describe('getSessionMessagesById', () => {
  test('Should get only session messages', async () => {
    const { session } = await insertSession({
      messages: [
        buildMessage({ user: getObjectId() }),
        buildMessage({ user: getObjectId() }),
      ],
    })

    const foundSession = await SessionRepo.getSessionMessagesById(session._id)

    expect(foundSession?.messages.length).toBe(2)
  })
})
*/
