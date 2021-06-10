import mongoose from 'mongoose'
import SessionModel, * as SessionRepo from '../../models/Session'
import {
  getSession,
  insertSession,
  insertSessionWithVolunteer
} from '../db-utils'
import { DocCreationError, DocUpdateError } from '../../models/Errors'
import {
  buildMessage,
  buildNotification,
  getObjectId,
  getStringObjectId
} from '../generate'
import {
  SESSION_FLAGS,
  SESSION_REPORT_REASON,
  SUBJECTS,
  SUBJECT_TYPES
} from '../../constants'
import { LookupError } from '../../utils/type-utils'
import VolunteerModel from '../../models/Volunteer'
import StudentModel from '../../models/Student'

const invalidId = '123'
const getStartDate = () => new Date().getTime() - 1000 * 60 * 10
const getEndDate = () => new Date().getTime()

async function cleanup() {
  await SessionModel.deleteMany({})
  await StudentModel.deleteMany({})
  await VolunteerModel.deleteMany({})
}

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
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
      isStudentBanned: false
    }

    const result = await SessionRepo.createSession(newSession)
    const expected = {
      type: newSession.type,
      subTopic: newSession.subTopic,
      student: newSession.studentId
    }
    expect(result._id).toBeDefined()
    expect(result).toMatchObject(expected)
  })

  test('Should throw error with invalid input', async () => {
    const newSession = {
      studentId: null,
      type: 'bogus',
      subTopic: SUBJECTS.ALGEBRA_ONE,
      isStudentBanned: false
    }

    await expect(SessionRepo.createSession(newSession)).rejects.toBeInstanceOf(
      DocCreationError
    )
  })
})

describe('addNotifications', () => {
  let session

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
        volunteer: getObjectId()
      }),
      buildNotification({
        volunteer: getObjectId()
      })
    ]
    await SessionRepo.addNotifications(session._id, notifications)
    const updatedSession = await getSession(
      { _id: session._id },
      { notifications: 1 }
    )
    expect(updatedSession.notifications).toHaveLength(2)
  })

  test('Should throw error with invalid input', async () => {
    await expect(
      SessionRepo.addNotifications(
        session._id,
        buildNotification({
          volunteer: getObjectId()
        })
      )
    ).rejects.toBeInstanceOf(DocUpdateError)
  })
})

describe('getUnfulfilledSessions', () => {
  test.todo('getUnfulfilledSessions tests')
})

describe('getSessionById', () => {
  let session

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should get session by id', async () => {
    const result = await SessionRepo.getSessionById(session._id)
    const expected = {
      _id: session._id,
      student: session.student,
      volunteer: session.volunteer,
      type: session.type,
      subTopic: session.subTopic,
      messages: session.messages,
      hasWhiteboardDoc: session.hasWhiteboardDoc,
      whiteboardDoc: session.whiteboardDoc,
      quillDoc: undefined,
      createdAt: session.createdAt,
      volunteerJoinedAt: session.volunteerJoinedAt,
      failedJoins: session.failedJoins,
      endedAt: session.endedAt,
      endedBy: session.endedBy,
      notifications: session.notifications,
      photos: session.photos,
      isReported: session.isReported,
      reportReason: session.reportReason,
      reportMessage: session.reportMessage,
      flags: session.flags,
      reviewedStudent: session.reviewedStudent,
      reviewedVolunteer: session.reviewedVolunteer,
      timeTutored: session.timeTutored
    }
    expect(result).toEqual(expected)
  })

  test('Should throw error if no session is found', async () => {
    await expect(
      SessionRepo.getSessionById(getObjectId())
    ).rejects.toBeInstanceOf(LookupError)
  })

  test('Should throw error with invalid input', async () => {
    await expect(SessionRepo.getSessionById(invalidId)).rejects.toThrow()
  })
})

describe('updateFlags', () => {
  let session

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should update flags and set reviewedStudent and reviewedVolunteer to false', async () => {
    const flags = [
      SESSION_FLAGS.FIRST_TIME_STUDENT,
      SESSION_FLAGS.FIRST_TIME_VOLUNTEER
    ]
    await SessionRepo.updateFlags(session._id, flags)

    const updatedSession = await getSession(
      { _id: session._id },
      { flags: 1, reviewedStudent: 1, reviewedVolunteer: 1 }
    )
    expect(updatedSession.flags).toHaveLength(2)
    expect(updatedSession.flags).toEqual(flags)
    expect(updatedSession.reviewedStudent).toBeFalsy()
    expect(updatedSession.reviewedVolunteer).toBeFalsy()
  })

  test('Should throw error with invalid input', async () => {
    await expect(SessionRepo.updateFlags(invalidId, [])).rejects.toBeInstanceOf(
      DocUpdateError
    )
  })
})

describe('updateFailedJoins', () => {
  let session

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should update failed joins', async () => {
    const userId = getObjectId()
    await SessionRepo.updateFailedJoins(session._id, userId)

    const updatedSession = await getSession(
      { _id: session._id },
      { failedJoins: 1 }
    )

    expect(updatedSession.failedJoins[0]).toEqual(userId)
  })

  test('Should throw error with invalid input', async () => {
    await expect(
      SessionRepo.updateFailedJoins(invalidId, getObjectId())
    ).rejects.toBeInstanceOf(DocUpdateError)
  })
})

describe('updateReviewedStudent', () => {
  let session

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should update reviewedStudent', async () => {
    await SessionRepo.updateReviewedStudent(session._id, true)
    const updatedSession = await getSession(
      { _id: session._id },
      { reviewedStudent: 1 }
    )
    expect(updatedSession.reviewedStudent).toBeTruthy()
  })

  test('Should throw error with invalid input', async () => {
    await expect(
      SessionRepo.updateReviewedStudent(invalidId, false)
    ).rejects.toBeInstanceOf(DocUpdateError)
  })
})

describe('updateReviewedVolunteer', () => {
  let session

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should update reviewedVolunteer', async () => {
    await SessionRepo.updateReviewedVolunteer(session._id, true)
    const updatedSession = await getSession(
      { _id: session._id },
      { reviewedVolunteer: 1 }
    )
    expect(updatedSession.reviewedVolunteer).toBeTruthy()
  })

  test('Should throw error with invalid input', async () => {
    await expect(
      SessionRepo.updateReviewedVolunteer(invalidId, false)
    ).rejects.toBeInstanceOf(DocUpdateError)
  })
})

describe('getSessionToEnd', () => {
  afterAll(async () => {
    await cleanup()
  })

  test('Should get an unmatched session that is ending', async () => {
    const { session, student } = await insertSession()
    const result = await SessionRepo.getSessionToEnd(session._id.toString())
    const expected = {
      _id: session._id,
      createdAt: session.createdAt,
      endedAt: session.endedAt,
      isReported: session.isReported,
      messages: session.messages,
      type: session.type,
      student: {
        _id: student._id,
        firstname: student.firstname,
        email: student.email,
        pastSessions: student.pastSessions
      },
      volunteer: {},
      volunteerJoinedAt: session.volunteerJoinedAt
    }
    expect(result._id).toBeDefined()
    expect(result).toMatchObject(expected)
  })

  test('Should get a matched session that is ending', async () => {
    const { session, student, volunteer } = await insertSessionWithVolunteer()
    const result = await SessionRepo.getSessionToEnd(session._id.toString())
    const expected = {
      _id: session._id,
      createdAt: session.createdAt,
      endedAt: session.endedAt,
      isReported: session.isReported,
      messages: session.messages,
      type: session.type,
      student: {
        _id: student._id,
        firstname: student.firstname,
        email: student.email,
        pastSessions: student.pastSessions
      },
      volunteer: {
        _id: volunteer._id,
        firstname: volunteer.firstname,
        email: volunteer.email,
        pastSessions: volunteer.pastSessions,
        volunteerPartnerOrg: volunteer.volunteerPartnerOrg
      },
      volunteerJoinedAt: session.volunteerJoinedAt
    }
    expect(result._id).toBeDefined()
    expect(result).toMatchObject(expected)
  })

  test('Should throw error when no session is found', async () => {
    await expect(
      SessionRepo.getSessionToEnd(getStringObjectId())
    ).rejects.toBeInstanceOf(LookupError)
  })

  test('Should throw error with invalid input', async () => {
    await expect(SessionRepo.getSessionToEnd(invalidId)).rejects.toThrow()
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
      timeTutored: 10000
    })
    await insertSession({
      volunteer: volunteer._id,
      timeTutored: 5000
    })

    const result = await SessionRepo.getTotalTimeTutoredForDateRange(
      volunteer._id.toString(),
      getStartDate(),
      getEndDate()
    )
    const expected = [
      {
        _id: null,
        timeTutored: 15000
      }
    ]
    expect(result).toEqual(expected)
  })

  test('Should throw error with invalid input', async () => {
    await expect(
      SessionRepo.getTotalTimeTutoredForDateRange(
        invalidId,
        getStartDate(),
        getEndDate()
      )
    ).rejects.toThrow()
  })
})

describe('getActiveSessionsWithVolunteers', () => {
  afterAll(async () => {
    await cleanup()
  })

  test('Should get all matched sessions that have not ended', async () => {
    const { session, volunteer } = await insertSessionWithVolunteer({
      endedAt: undefined
    })
    const result = await SessionRepo.getActiveSessionsWithVolunteers()
    const expected = [
      {
        _id: session._id,
        volunteer: volunteer._id
      }
    ]
    expect(result).toEqual(expected)
  })

  test.todo('Should throw error')
})

describe('updateReportSession', () => {
  let session

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
  })

  afterAll(async () => {
    await cleanup()
  })

  const report = {
    reportReason: SESSION_REPORT_REASON.STUDENT_MISUSE,
    reportMessage: 'asked for answers'
  }

  test('Should report a session', async () => {
    await SessionRepo.updateReportSession(session._id.toString(), report)
    const updatedSession = await getSession(
      { _id: session._id },
      { isReported: 1, reportReason: 1, reportMessage: 1 }
    )
    expect(updatedSession.isReported).toBeTruthy()
    expect(updatedSession.reportReason).toBe(report.reportReason)
    expect(updatedSession.reportMessage).toBe(report.reportMessage)
  })

  test('Should throw error with invalid input', async () => {
    await expect(
      SessionRepo.updateReportSession(invalidId, report)
    ).rejects.toThrow()
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
      timeTutored: 5000,
      hasWhiteboardDoc: true,
      quillDoc: '',
      flags: [SESSION_FLAGS.FIRST_TIME_STUDENT],
      reviewedStudent: false,
      reviewedVolunteer: false
    }
    await SessionRepo.updateSessionToEnd(session._id.toString(), data)
    const updatedSession = await getSession(
      { _id: session._id },
      {
        endedAt: 1,
        endedBy: 1,
        timeTutored: 1,
        hasWhiteboardDoc: 1,
        quillDoc: 1,
        flags: 1,
        reviewedStudent: 1,
        reviewedVolunteer: 1
      }
    )

    const expected = {
      _id: session._id,
      ...data
    }
    expect(updatedSession).toEqual(expected)
  })

  test('Should throw error with invalid input', async () => {
    await expect(
      SessionRepo.updateSessionToEnd(invalidId, {
        endedAt: new Date(),
        endedBy: getObjectId(),
        timeTutored: 5000,
        hasWhiteboardDoc: true,
        quillDoc: '',
        flags: [SESSION_FLAGS.FIRST_TIME_STUDENT],
        reviewedStudent: false,
        reviewedVolunteer: false
      })
    ).rejects.toBeInstanceOf(DocUpdateError)
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
    const startDate = getStartDate()
    const endDate = getEndDate()

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

  test('Should throw error with invalid input', async () => {
    await expect(SessionRepo.getLongRunningSessions('', '')).rejects.toThrow()
  })
})

describe('addSessionPhotoKey', () => {
  const photoKey = '12345'
  let session

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should add photo key to photos', async () => {
    await SessionRepo.addSessionPhotoKey(session._id.toString(), photoKey)
    const updatedSession = await getSession(
      { _id: session._id },
      {
        photos: 1
      }
    )
    expect(updatedSession.photos).toContain(photoKey)
  })

  test('Should throw error with invalid input', async () => {
    await expect(
      SessionRepo.addSessionPhotoKey(invalidId, photoKey)
    ).rejects.toBeInstanceOf(DocUpdateError)
  })
})

describe('getPublicSession', () => {
  let session
  let student
  let volunteer

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
    const result = await SessionRepo.getPublicSession(session._id.toString())
    const expected = [
      {
        _id: session._id,
        createdAt: session.createdAt,
        endedAt: session.endedAt,
        type: session.type,
        subTopic: session.subTopic,
        student: {
          _id: student._id,
          firstName: student.firstname
        },
        volunteer: {
          _id: volunteer._id,
          firstName: volunteer.firstname
        }
      }
    ]
    expect(result).toEqual(expected)
  })

  test('Should throw error with invalid input', async () => {
    await expect(SessionRepo.getPublicSession(invalidId)).rejects.toThrow()
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
      session._id.toString()
    )
    const expected = {
      _id: session._id,
      createdAt: session.createdAt,
      endedAt: session.endedAt,
      type: session.type,
      subTopic: session.subTopic,
      student: {
        _id: student._id,
        isVolunteer: student.isVolunteer,
        firstname: student.firstname,
        pastSessions: student.pastSessions,
        createdAt: student.createdAt
      },
      volunteer: {
        _id: volunteer._id,
        isVolunteer: volunteer.isVolunteer,
        firstname: volunteer.firstname,
        pastSessions: volunteer.pastSessions,
        createdAt: volunteer.createdAt
      },
      messages: session.messages,
      hasWhiteboardDoc: session.hasWhiteboardDoc,
      whiteboardDoc: session.whiteboardDoc,
      quillDoc: session.quillDoc,
      volunteerJoinedAt: session.volunteerJoinedAt,
      failedJoins: session.failedJoins,
      endedBy: session.endedBy,
      notifications: session.notifications,
      photos: session.photos,
      isReported: session.isReported,
      reportReason: session.reportReason,
      reportMessage: session.reportMessage,
      flags: session.flags,
      reviewedStudent: session.reviewedStudent,
      reviewedVolunteer: session.reviewedVolunteer,
      timeTutored: session.timeTutored
    }

    expect(result).toEqual(expected)
  })

  test('Should throw error with invalid input', async () => {
    await expect(
      SessionRepo.getSessionByIdWithStudentAndVolunteer(invalidId)
    ).rejects.toThrow()
  })
})

describe('getCurrentSession', () => {
  afterAll(async () => {
    await cleanup()
  })

  test('Should get the current session for the given userId', async () => {
    const { session, student, volunteer } = await insertSessionWithVolunteer({
      endedAt: undefined
    })
    const result = await SessionRepo.getCurrentSession(volunteer._id.toString())
    const expected = {
      _id: session._id,
      student: {
        _id: student._id.toString(),
        firstname: student.firstname,
        isVolunteer: student.isVolunteer
      },
      volunteer: {
        _id: volunteer._id.toString(),
        firstname: volunteer.firstname,
        isVolunteer: volunteer.isVolunteer
      },
      subTopic: session.subTopic,
      type: session.type,
      messages: session.messages,
      createdAt: session.createdAt,
      endedAt: session.endedAt && session.endedAt,
      volunteerJoinedAt: session.volunteerJoinedAt
    }

    expect(result).toEqual(expected)
  })

  test('Should throw error with invalid input', async () => {
    await expect(
      SessionRepo.getSessionByIdWithStudentAndVolunteer(invalidId)
    ).rejects.toThrow()
  })
})

describe('getStudentLatestSession', () => {
  let session
  let student

  beforeAll(async () => {
    const insertedSession = await insertSessionWithVolunteer()
    session = insertedSession.session
    student = insertedSession.student
  })

  afterAll(async () => {
    await cleanup()
  })

  test('Should get the latest session for the given studentId', async () => {
    const result = await SessionRepo.getStudentLatestSession(
      student._id.toString()
    )
    const expected = {
      _id: session._id.toString(),
      createdAt: session.createdAt.toISOString()
    }

    expect(result).toEqual(expected)
  })

  test('Should throw error with invalid input', async () => {
    await expect(
      SessionRepo.getStudentLatestSession(invalidId)
    ).rejects.toThrow()
  })
})

describe('addVolunteerToSession', () => {
  test('Should add volunteer the session', async () => {
    const { session } = await insertSession()
    const volunteer = getObjectId()
    await SessionRepo.addVolunteerToSession(session._id.toString(), volunteer)
    const updatedSession = await getSession(
      { _id: session._id },
      {
        volunteer: 1,
        volunteerJoinedAt: 1
      }
    )
    expect(updatedSession.volunteerJoinedAt).toBeTruthy()
    expect(updatedSession.volunteer).toEqual(volunteer)
  })

  test('Should throw error with invalid input', async () => {
    await expect(
      SessionRepo.addVolunteerToSession(invalidId, getObjectId())
    ).rejects.toBeInstanceOf(DocUpdateError)
  })
})

describe('addMessage', () => {
  let session
  let student

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
      user: student._id
    })
    await SessionRepo.addMessage(session._id.toString(), message)
    const updatedSession = await getSession(
      { _id: session._id },
      {
        messages: 1
      }
    )
    expect(updatedSession.messages).toHaveLength(1)
  })

  test('Should throw error with invalid input', async () => {
    await expect(
      SessionRepo.addMessage(invalidId, buildMessage())
    ).rejects.toBeInstanceOf(DocUpdateError)
  })
})
