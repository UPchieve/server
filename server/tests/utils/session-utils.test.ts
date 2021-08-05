import {
  didParticipantsChat,
  getMessagesAfterDate,
  getReviewFlags,
  getFeedbackFlags,
  calculateTimeTutored,
  isSessionParticipant,
  isSessionFulfilled,
  hasReviewTriggerFlags,
  isSubjectUsingDocumentEditor
} from '../../utils/session-utils'
import { Student } from '../../models/Student'
import { Volunteer } from '../../models/Volunteer'
import {
  buildMessage,
  buildStudent,
  buildVolunteer,
  buildSession,
  buildPastSessions,
  generateSentence,
  getObjectId
} from '../generate'
import { Message } from '../../models/Message'
import { SESSION_FLAGS, SUBJECTS } from '../../constants'

/**
 * @todo refactor
 * - some of the test cases are getting too complicated to rely on this function anymore
 *
 * some additional notes:
 * an ABSENT_USER flag gets triggered in some test cases because
 * the volunteerJoinedAt is greater than the createdAt of the messages. refactor to
 * allow an easier way to trigger or not trigger ABSENT_USER or LOW_MESSAGES flags
 */
const loadMessages = ({
  studentSentMessages,
  volunteerSentMessages,
  messagesPerUser = 10,
  studentOverrides = {},
  volunteerOverrides = {}
}): {
  messages: Message[]
  student: Partial<Student>
  volunteer: Partial<Volunteer>
} => {
  const messages = []
  const student = buildStudent({
    pastSessions: buildPastSessions(),
    ...studentOverrides
  })
  const volunteer = buildVolunteer({
    pastSessions: buildPastSessions(),
    ...volunteerOverrides
  })

  for (let i = 0; i < messagesPerUser; i++) {
    if (studentSentMessages)
      messages.push(
        buildMessage({
          user: student._id
        })
      )
    if (volunteerSentMessages)
      messages.push(
        buildMessage({
          user: volunteer._id
        })
      )
  }

  return { messages, student, volunteer }
}

beforeEach(async () => {
  jest.clearAllMocks()
  jest.resetAllMocks()
})

describe('calculateTimeTutored', () => {
  const similarTestCases = [
    'Return 0ms if no volunteer has joined the session',
    'Return 0ms if no volunteerJoinedAt and no endedAt',
    'Return 0ms if no messages were sent during the session'
  ]
  for (const testCase of similarTestCases) {
    test(testCase, async () => {
      const session = buildSession()
      const result = calculateTimeTutored(session)
      const expectedTimeTutored = 0

      expect(result).toEqual(expectedTimeTutored)
    })
  }

  test('Return 0ms if volunteer joined after session ended', () => {
    const createdAt = new Date('2020-10-05T12:00:00.000Z')
    const endedAt = new Date('2020-10-05T12:05:00.000Z')
    const volunteerJoinedAt = new Date('2020-10-05T12:10:00.000Z')
    const volunteer = buildVolunteer()
    const session = buildSession({
      createdAt,
      endedAt,
      volunteerJoinedAt,
      volunteer: volunteer._id,
      messages: buildMessage({
        user: volunteer._id,
        createdAt: new Date('2020-10-05T12:03:00.000Z')
      })
    })

    const result = calculateTimeTutored(session)
    const expectedTimeTutored = 0

    expect(result).toEqual(expectedTimeTutored)
  })

  test('Return 0ms if latest message was sent before a volunteer joined', () => {
    const createdAt = new Date('2020-10-05T12:00:00.000Z')
    const endedAt = new Date('2020-10-05T12:05:00.000Z')
    const volunteerJoinedAt = new Date('2020-10-05T12:10:00.000Z')
    const student = buildStudent()
    const volunteer = buildVolunteer()
    const session = buildSession({
      createdAt,
      endedAt,
      volunteerJoinedAt,
      volunteer: volunteer._id,
      student: student._id,
      messages: buildMessage({
        user: student._id,
        createdAt: new Date('2020-10-05T12:03:00.000Z')
      })
    })

    const result = calculateTimeTutored(session)
    const expectedTimeTutored = 0

    expect(result).toEqual(expectedTimeTutored)
  })

  test('Should return amount of time tutored', () => {
    const createdAt = new Date('2020-10-05T12:00:00.000Z')
    const endedAt = new Date('2020-10-05T12:05:00.000Z')
    const volunteerJoinedAt = new Date('2020-10-05T12:01:00.000Z')
    const lastMessageSentAt = new Date('2020-10-05T12:03:00.000Z')
    const volunteer = buildVolunteer()
    const session = buildSession({
      createdAt,
      endedAt,
      volunteerJoinedAt,
      volunteer: volunteer._id,
      messages: [
        buildMessage({
          user: volunteer._id,
          createdAt: lastMessageSentAt
        })
      ]
    })

    const result = calculateTimeTutored(session)
    const expectedTimeTutored =
      lastMessageSentAt.getTime() - volunteerJoinedAt.getTime()

    expect(result).toEqual(expectedTimeTutored)
  })

  test('Should calculate time tutored for sessions less than 3 hours', () => {
    const createdAt = new Date('2020-10-05T11:55:00.000Z')
    const endedAt = new Date('2020-10-06T14:06:00.000Z')
    const volunteerJoinedAt = new Date('2020-10-05T12:00:00.000Z')
    const lastMessageSentAt = new Date('2020-10-05T14:05:00.000Z')
    const volunteer = buildVolunteer()
    const session = buildSession({
      createdAt,
      endedAt,
      volunteerJoinedAt,
      volunteer: volunteer._id,
      messages: [
        buildMessage({
          user: volunteer._id,
          createdAt: lastMessageSentAt
        })
      ]
    })

    const result = calculateTimeTutored(session)
    const expectedTimeTutored =
      lastMessageSentAt.getTime() - volunteerJoinedAt.getTime()
    expect(result).toEqual(expectedTimeTutored)
  })

  // When sessions are greater than 3 hours, use the last messages that were sent
  // within a 15 minute window to get an estimate of the session length / hours tutored
  test('Should calculate time tutored for sessions greater than 3 hours', () => {
    const createdAt = new Date('2020-10-05T11:55:00.000Z')
    const endedAt = new Date('2020-10-06T16:00:00.000Z')
    const volunteerJoinedAt = new Date('2020-10-05T12:00:00.000Z')
    const lastMessageSentAt = new Date('2020-10-05T15:59:00.000Z')
    const volunteer = buildVolunteer()
    const session = buildSession({
      createdAt,
      endedAt,
      volunteerJoinedAt,
      volunteer: volunteer._id,
      messages: [
        buildMessage({
          user: volunteer._id,
          createdAt: new Date('2020-10-05T14:05:00.000Z')
        }),
        buildMessage({
          user: volunteer._id,
          createdAt: new Date('2020-10-05T15:58:00.000Z')
        }),
        buildMessage({
          user: volunteer._id,
          createdAt: lastMessageSentAt
        })
      ]
    })

    const result = calculateTimeTutored(session)
    const expectedTimeTutored =
      lastMessageSentAt.getTime() - volunteerJoinedAt.getTime()
    expect(result).toEqual(expectedTimeTutored)
  })
})

describe('didParticipantsChat', () => {
  test('Should return true when student and volunteer sent messages back and forth', async () => {
    const { messages, student, volunteer } = loadMessages({
      studentSentMessages: true,
      volunteerSentMessages: true
    })

    const result = didParticipantsChat(messages, student._id, volunteer._id)
    expect(result).toBeTruthy()
  })

  test('Should return false when only the student sent messages', async () => {
    const { messages, student, volunteer } = loadMessages({
      studentSentMessages: true,
      volunteerSentMessages: false
    })

    const result = didParticipantsChat(messages, student._id, volunteer._id)
    expect(result).toBeFalsy()
  })

  test('Should return false when only the volunteer sent messages', async () => {
    const { messages, student, volunteer } = loadMessages({
      studentSentMessages: false,
      volunteerSentMessages: true
    })

    const result = didParticipantsChat(messages, student._id, volunteer._id)
    expect(result).toBeFalsy()
  })

  test('Should return false when no messages were sent', async () => {
    const { messages, student, volunteer } = loadMessages({
      studentSentMessages: false,
      volunteerSentMessages: false,
      messagesPerUser: 0
    })
    const result = didParticipantsChat(messages, student._id, volunteer._id)
    expect(result).toBeFalsy()
  })
})

describe('getReviewFlags', () => {
  test(`Should trigger ${SESSION_FLAGS.FIRST_TIME_STUDENT} flag for a student's first session`, async () => {
    const { messages, student, volunteer } = loadMessages({
      studentSentMessages: true,
      volunteerSentMessages: true,
      studentOverrides: {
        pastSessions: []
      }
    })
    const session = buildSession({
      createdAt: new Date('2020-10-05T12:03:00.000Z'),
      endedAt: new Date('2020-10-05T14:03:00.000Z'),
      student: student._id,
      volunteer: volunteer._id,
      messages
    })
    const populatedSession = {
      ...session,
      student,
      volunteer
    }
    const result = getReviewFlags(populatedSession)
    const expected = SESSION_FLAGS.FIRST_TIME_STUDENT
    expect(result).toContain(expected)
  })

  test(`Should trigger ${SESSION_FLAGS.FIRST_TIME_VOLUNTEER} flag for a volunteer's first session`, async () => {
    const { messages, student, volunteer } = loadMessages({
      studentSentMessages: true,
      volunteerSentMessages: true,
      messagesPerUser: 13,
      volunteerOverrides: {
        pastSessions: []
      }
    })
    const session = await buildSession({
      createdAt: new Date('2020-10-05T12:03:00.000Z'),
      endedAt: new Date('2020-10-05T14:03:00.000Z'),
      student: student._id,
      volunteer: volunteer._id,
      messages
    })
    const populatedSession = {
      ...session,
      student,
      volunteer
    }

    const result = getReviewFlags(populatedSession)
    const expected = SESSION_FLAGS.FIRST_TIME_VOLUNTEER
    expect(result).toContain(expected)
  })

  test(`Should trigger ${SESSION_FLAGS.UNMATCHED} flag when a volunter does not join the session`, async () => {
    const { messages, student } = loadMessages({
      studentSentMessages: false,
      volunteerSentMessages: false,
      messagesPerUser: 0
    })
    const session = await buildSession({
      createdAt: new Date('2020-10-05T12:03:00.000Z'),
      endedAt: new Date('2020-10-05T14:03:00.000Z'),
      student: student._id,
      messages
    })
    const populatedSession = {
      ...session,
      student
    }

    const result = getReviewFlags(populatedSession)
    const expected = [SESSION_FLAGS.UNMATCHED]
    expect(result).toEqual(expected)
  })

  test(`Should trigger ${SESSION_FLAGS.LOW_MESSAGES} flag`, async () => {
    const student = buildStudent({ pastSessions: buildPastSessions() })
    const volunteer = buildVolunteer({ pastSessions: buildPastSessions() })
    const volunteerJoinedAt = new Date('2020-10-05T12:03:30.000Z')

    const messages = [
      { user: student._id, createdAt: new Date('2020-10-05T12:04:30.000Z') },
      { user: volunteer._id, createdAt: new Date('2020-10-05T12:05:30.000Z') }
    ]

    const session = await buildSession({
      createdAt: new Date('2020-10-05T12:03:00.000Z'),
      endedAt: new Date('2020-10-05T14:03:00.000Z'),
      student: student._id,
      volunteer,
      messages,
      volunteerJoinedAt
    })

    const populatedSession = {
      ...session,
      student,
      volunteer
    }

    const result = getReviewFlags(populatedSession)
    const expected = [SESSION_FLAGS.LOW_MESSAGES]
    expect(result).toEqual(expected)
  })

  test(`Should trigger ${SESSION_FLAGS.ABSENT_USER} flag when only one user sends messages`, async () => {
    const { messages, student, volunteer } = loadMessages({
      studentSentMessages: true,
      volunteerSentMessages: false,
      messagesPerUser: 10
    })
    const session = await buildSession({
      createdAt: new Date('2020-10-05T12:03:00.000Z'),
      endedAt: new Date('2020-10-05T14:03:00.000Z'),
      student: student._id,
      volunteer,
      messages
    })
    const populatedSession = {
      ...session,
      student,
      volunteer
    }

    const result = getReviewFlags(populatedSession)
    const expected = [SESSION_FLAGS.ABSENT_USER]
    expect(result).toEqual(expected)
  })

  test(`Should trigger ${SESSION_FLAGS.ABSENT_USER} flag when no user sends messages`, async () => {
    const { messages, student, volunteer } = loadMessages({
      studentSentMessages: false,
      volunteerSentMessages: false,
      messagesPerUser: 0
    })
    const session = await buildSession({
      createdAt: Date.now(),
      endedAt: Date.now(),
      student: student._id,
      volunteer,
      messages
    })
    const populatedSession = {
      ...session,
      student,
      volunteer
    }

    const result = getReviewFlags(populatedSession)
    const expected = [SESSION_FLAGS.ABSENT_USER]
    expect(result).toEqual(expected)
  })

  test(`Should trigger ${SESSION_FLAGS.REPORTED} flag when a session was reported`, async () => {
    const { messages, student, volunteer } = loadMessages({
      studentSentMessages: true,
      volunteerSentMessages: true,
      messagesPerUser: 20
    })
    const session = await buildSession({
      createdAt: new Date('2020-10-05T12:03:00.000Z'),
      endedAt: Date.now(),
      student: student._id,
      volunteer,
      messages,
      isReported: true
    })
    const populatedSession = {
      ...session,
      student,
      volunteer
    }

    const result = getReviewFlags(populatedSession)
    const expected = SESSION_FLAGS.REPORTED
    expect(result).toContain(expected)
  })
})

describe('getFeedbackFlags', () => {
  test(`Should add ${SESSION_FLAGS.STUDENT_RATING} flag when student leaves a feedback rating with <= 3`, () => {
    const feedback = {
      'coach-rating': 1,
      'session-goal': 4
    }
    const result = getFeedbackFlags(feedback)
    const expected = [SESSION_FLAGS.STUDENT_RATING]
    expect(result).toEqual(expected)
  })

  test(`Should not add ${SESSION_FLAGS.STUDENT_RATING} flag when student leaves feedback ratings > 3`, () => {
    const feedback = {
      'coach-rating': 4,
      'session-goal': 4
    }
    const result = getFeedbackFlags(feedback)
    const expected = []
    expect(result).toEqual(expected)
  })
  test(`Should add ${SESSION_FLAGS.VOLUNTEER_RATING} flag when volunteer leaves a feedback rating with <= 3`, () => {
    const feedback = {
      'session-enjoyable': 3
    }
    const result = getFeedbackFlags(feedback)
    const expected = [SESSION_FLAGS.VOLUNTEER_RATING]
    expect(result).toEqual(expected)
  })
  test(`Should not add ${SESSION_FLAGS.VOLUNTEER_RATING} flag when student leaves feedback ratings > 3`, () => {
    const feedback = {
      'rate-session': {
        rating: 5
      }
    }
    const result = getFeedbackFlags(feedback)
    const expected = []
    expect(result).toEqual(expected)
  })

  test(`Should add ${SESSION_FLAGS.COMMENT} flag when user leaves a comment`, () => {
    const comment = generateSentence()
    const feedback = {
      'other-feedback': comment
    }
    const result = getFeedbackFlags(feedback)
    const expected = [SESSION_FLAGS.COMMENT]
    expect(result).toEqual(expected)
  })
})

describe('hasReviewTriggerFlags', () => {
  test('Should return true if flags contains a flag that triggers a review', () => {
    const flags = [SESSION_FLAGS.REPORTED, SESSION_FLAGS.FIRST_TIME_STUDENT]
    const result = hasReviewTriggerFlags(flags)
    expect(result).toBe(true)
  })
  test('Should return false if flags contains a flag that does not trigger a review', () => {
    const flags = [SESSION_FLAGS.UNMATCHED, SESSION_FLAGS.LOW_MESSAGES]
    const result = hasReviewTriggerFlags(flags)
    expect(result).toBe(false)
  })
})

describe('getMessagesAfterDate', () => {
  test('Should return messages after a given date', async () => {
    const student = buildStudent()
    const volunteer = buildVolunteer()
    const volunteerJoinedAt = new Date('2021-01-14T12:00:00.000Z')
    const messages = [
      buildMessage({
        user: student._id,
        createdAt: new Date('2021-01-14T11:45:00.000Z')
      }),
      buildMessage({
        user: student._id,
        createdAt: new Date('2021-01-14T11:55:00.000Z')
      }),
      buildMessage({
        user: student._id,
        createdAt: new Date('2021-01-14T12:00:00.000Z')
      }),
      buildMessage({
        user: volunteer._id,
        createdAt: new Date('2021-01-14T12:10:00.000Z')
      }),
      buildMessage({
        user: student._id,
        createdAt: new Date('2021-01-14T12:15:00.000Z')
      })
    ]

    const results = getMessagesAfterDate(messages, volunteerJoinedAt)
    expect(results).toHaveLength(3)
  })

  test('Should return an empty array if no messages were sent', async () => {
    const volunteerJoinedAt = new Date('2021-01-14T12:00:00.000Z')
    const messages = []

    const results = getMessagesAfterDate(messages, volunteerJoinedAt)

    expect(results).toHaveLength(0)
  })
})

describe('isSessionParticipant', () => {
  test('Student as ObjectId should be session participant', async () => {
    const student = buildStudent()
    const session = buildSession({ student: student._id })
    const result = isSessionParticipant(session, student)
    expect(result).toBeTruthy()
  })

  test('Volunteer as ObjectId should be session participant', async () => {
    const volunteer = buildVolunteer()
    const session = buildSession({
      student: buildStudent(),
      volunteer: volunteer._id
    })
    const result = isSessionParticipant(session, volunteer)
    expect(result).toBeTruthy()
  })

  test('Populated student should be session participant', async () => {
    const student = buildStudent()
    const session = buildSession({ student })
    const result = isSessionParticipant(session, student)
    expect(result).toBeTruthy()
  })

  test('Populated volunteer should be session participant', async () => {
    const student = buildStudent()
    const volunteer = buildVolunteer()
    const session = buildSession({ student, volunteer })
    const result = isSessionParticipant(session, volunteer)
    expect(result).toBeTruthy()
  })

  test('Should throw error if user is not session participant', async () => {
    const volunteer = buildVolunteer()
    const session = buildSession({
      student: buildStudent(),
      volunteer: getObjectId()
    })
    try {
      isSessionParticipant(session, volunteer)
    } catch (error) {
      expect(error.message).toBe(
        'Only session participants are allowed to send messages'
      )
    }
  })
})

describe('isSessionFulfilled', () => {
  test('Should return false if the session has not ended and no volunteer has joined', async () => {
    const result = isSessionFulfilled(buildSession())
    expect(result).toBe(false)
  })

  test('Should return true if session has ended', async () => {
    const result = isSessionFulfilled(buildSession({ endedAt: new Date() }))
    expect(result).toBe(true)
  })

  test('Should return true if volunteer joined the session', async () => {
    const result = isSessionFulfilled(
      buildSession({ volunteer: getObjectId() })
    )
    expect(result).toBe(true)
  })
})

describe('isSubjectUsingDocumentEditor', () => {
  test('Should return true for all subjects that use a document editor', async () => {
    const subjects = [
      SUBJECTS.SAT_READING,
      SUBJECTS.ESSAYS,
      SUBJECTS.PLANNING,
      SUBJECTS.APPLICATIONS,
      SUBJECTS.HUMANITIES_ESSAYS
    ]

    for (const subject of subjects) {
      expect(isSubjectUsingDocumentEditor(subject)).toBeTruthy()
    }
  })

  test('Should return false for that do not use a document editor', async () => {
    const subjects = [
      SUBJECTS.ALGEBRA_ONE,
      SUBJECTS.CALCULUS_AB,
      SUBJECTS.SAT_MATH,
      SUBJECTS.PHYSICS_ONE,
      SUBJECTS.BIOLOGY
    ]

    for (const subject of subjects) {
      expect(isSubjectUsingDocumentEditor(subject)).toBeFalsy()
    }
  })
})
