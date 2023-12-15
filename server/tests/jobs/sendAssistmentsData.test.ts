test.todo('postgres migration')
/*import axios from 'axios'
import { mocked } from 'jest-mock';
import { Types } from 'mongoose'

import { buildMessage, buildSession } from '../generate'
import * as sendAssistmentsData from '../../worker/jobs/sendAssistmentsData'
import { Session } from '../../models/Session'
import { Message } from '../../models/Message'
import { AssistmentsData } from '../../models/AssistmentsData'
import * as AssistmentsDataRepo from '../../models/AssistmentsData/queries'
import * as SessionRepo from '../../models/Session/queries'
import * as log from '../../worker/logger'

jest.setTimeout(25 * 1000)

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

jest.mock('../../models/AssistmentsData/queries')
const mockedAssistmentsDataRepo = mocked(AssistmentsDataRepo)

jest.mock('../../models/Session/queries')
const mockedSessionRepo = mocked(SessionRepo)

jest.mock('../../worker/logger')

function generateTestMessages(
  student: Types.ObjectId,
  volunteer: Types.ObjectId
): Message[] {
  const messages = []
  for (let i: number = 0; i < 5; i++) {
    let sender = volunteer
    if (i % 2 === 0) sender = student
    messages.push(
      buildMessage({
        user: sender,
      })
    )
  }
  return messages
}

function generateTestSession(): Session {
  const student = new Types.ObjectId()
  const volunteer = new Types.ObjectId()
  const messages = generateTestMessages(student, volunteer)
  const session = buildSession({
    student,
    volunteer,
    volunteerJoinedAt: new Date(),
    endedAt: new Date(),
    timeTutored: 1,
    messages,
  })
  return session
}

function generateAssistmentsData(session: Session): AssistmentsData {
  return {
    _id: new Types.ObjectId(),
    problemId: 12345,
    assignmentId: 'assignment',
    studentId: 'student',
    session: session._id,
    sent: false,
  }
}

describe('Test build request subroutine', () => {
  const session = generateTestSession()
  const ad = generateAssistmentsData(session)

  beforeEach(() => {
    jest.resetAllMocks()
  })

  beforeAll(() => {
    // restore spys between test suites
    jest.restoreAllMocks()
  })

  test('Successfully builds request from assistments data object', async () => {
    expect.assertions(1)
    mockedSessionRepo.getSessionById.mockResolvedValueOnce(session)

    const params = {
      assignmentXref: ad.assignmentId,
      userXref: ad.studentId,
    }
    const partSession = {
      createdAt: session.createdAt.getTime(),
      endedAt: session.endedAt && session.endedAt.getTime(),
      id: session._id.toString(),
      messages: sendAssistmentsData.pluckMessages(session.messages),
      studentId: session.student.toString(),
      subject: session.type,
      subTopic: session.subTopic,
      timeTutored: session.timeTutored,
      volunteerJoinedAt:
        session.volunteerJoinedAt && session.volunteerJoinedAt.getTime(),
      volunteerId: session.volunteer && session.volunteer.toString(),
    }
    const payload = {
      studentId: ad.studentId,
      assignmentId: ad.assignmentId,
      problemId: String(ad.problemId),
      session: partSession as sendAssistmentsData.PartSession,
    }
    const expected = { params, payload }

    await expect(sendAssistmentsData.buildRequest(ad)).resolves.toEqual(
      expected
    )
  })

  test('Throws on incomplete session data', async () => {
    expect.assertions(1)
    const clone = Object.assign({}, session)
    delete clone.endedAt

    mockedSessionRepo.getSessionById.mockResolvedValueOnce(clone)

    await expect(sendAssistmentsData.buildRequest(ad)).rejects.toThrow(
      `Error building request to send AssistmentsData ${ad._id}: `
    )
  })
})

describe('Test send data subroutine', () => {
  const session = generateTestSession()
  const ad = generateAssistmentsData(session)
  let params: sendAssistmentsData.Parameters,
    payload: sendAssistmentsData.Payload

  beforeEach(() => {
    jest.resetAllMocks()
  })

  beforeAll(() => {
    // build request as tested above
    params = {
      assignmentXref: ad.assignmentId,
      userXref: ad.studentId,
    }
    const partSession = {
      createdAt: session.createdAt.getTime(),
      endedAt: session.endedAt && session.endedAt.getTime(),
      id: session._id.toString(),
      messages: sendAssistmentsData.pluckMessages(session.messages),
      studentId: session.student.toString(),
      subject: session.type,
      subTopic: session.subTopic,
      timeTutored: session.timeTutored,
      volunteerJoinedAt:
        session.volunteerJoinedAt && session.volunteerJoinedAt.getTime(),
      volunteerId: session.volunteer && session.volunteer.toString(),
    }
    payload = {
      studentId: ad.studentId,
      assignmentId: ad.assignmentId,
      problemId: String(ad.problemId),
      session: partSession as sendAssistmentsData.PartSession,
    }
    // restore spys between test suites
    jest.restoreAllMocks()
  })

  test('Successfully sends request with 201', async () => {
    expect.assertions(1)
    mockedAxios.post.mockResolvedValueOnce({ status: 201 })

    // undefined check on resolves due to void return type
    await expect(
      sendAssistmentsData.sendData(params, payload)
    ).resolves.not.toThrow()
  })

  test('Throws status on 4xx', async () => {
    expect.assertions(1)
    const status = 401
    mockedAxios.post.mockResolvedValueOnce({ status })

    await expect(sendAssistmentsData.sendData(params, payload)).rejects.toThrow(
      status.toString()
    )
  })

  test('Throws "retry" on any server error', async () => {
    expect.assertions(1)
    const status = 500
    mockedAxios.post.mockResolvedValueOnce({ status })

    await expect(sendAssistmentsData.sendData(params, payload)).rejects.toThrow(
      'Retry'
    )
  })

  test('Throws "retry" on any network error', async () => {
    expect.assertions(1)
    const errMsg = 'test'
    mockedAxios.post.mockRejectedValueOnce(new Error(errMsg))

    await expect(sendAssistmentsData.sendData(params, payload)).rejects.toThrow(
      `Retry: ${errMsg}`
    )
  })
})

describe('Test full job', () => {
  const session = generateTestSession()
  const ad = generateAssistmentsData(session)
  const job = { data: { sessionId: session._id } }

  beforeEach(() => {
    // jest.resetAllMocks()
    // ensure ad is always found
    mockedAssistmentsDataRepo.getAssistmentsDataBySession.mockResolvedValue(ad)
    // ensure session for ad is always found
    mockedSessionRepo.getSessionById.mockResolvedValue(session)
  })

  test('Successfully runs', async () => {
    expect.assertions(1)
    // mock out network request
    mockedAxios.post.mockResolvedValueOnce({ status: 201 })

    // @ts-expect-error job partial type not accepted
    await expect(sendAssistmentsData.default(job)).resolves.not.toThrow()
  })

  test('Throws on build request fail', async () => {
    expect.assertions(1)
    const errMsg = 'test'
    mockedSessionRepo.getSessionById.mockRejectedValue(new Error(errMsg))

    // @ts-expect-error job partial type not accepted
    await expect(sendAssistmentsData.default(job)).rejects.toThrow(
      `Error building request to send AssistmentsData ${ad._id}: ${errMsg}`
    )
  })
  test('Throws on send data fail', async () => {
    expect.assertions(4)
    const errMsg = 'test'
    mockedAxios.post.mockRejectedValue(new Error(errMsg))

    // @ts-expect-error job partial type not accepted
    await expect(sendAssistmentsData.default(job)).rejects.toThrow(
      `Error sending AssistmentsData for session ${session._id}: Used up all attempts to send data`
    )
    expect(log.log).toHaveBeenCalledTimes(20)
    expect(log.log).toHaveBeenNthCalledWith(
      1,
      'AssistmentsData send attempt 1 failed'
    )
    expect(log.log).toHaveBeenLastCalledWith(`Retry: ${errMsg}`)
  })
  test('Throws on update assistments data fail', async () => {
    expect.assertions(1)
    // mock out network request
    mockedAxios.post.mockResolvedValueOnce({ status: 201 })

    const errMsg = 'test'
    mockedAssistmentsDataRepo.updateAssistmentsDataSentAtById.mockRejectedValueOnce(
      new Error(errMsg)
    )

    // @ts-expect-error job partial type not accepted
    await expect(sendAssistmentsData.default(job)).rejects.toThrow(
      `Error updating assistments data ${ad._id}: ${errMsg}`
    )
  })
})
*/
