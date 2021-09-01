import axios from 'axios'
import { backOff } from 'exponential-backoff'
import { Job } from 'bull'
import { Types } from 'mongoose'
import config from '../../config'
import {
  AssistmentsData,
  getBySession,
  updateSentAtById
} from '../../models/AssistmentsData'
import { Message } from '../../models/Message'
import { getSessionById } from '../../services/SessionService'
import { log } from '../logger'

interface PartMessage {
  contents: string
  createdAt: number // ms since epoch
  userId: string
}

interface PartSession {
  createdAt: number // ms since epoch
  endedAt: number // ms since epoch
  id: string
  messages: PartMessage[]
  studentId: string
  subject: string
  subTopic: string
  timeTutored: number
  volunteerJoinedAt: number // ms since epoch
  volunteerId: string
}

export interface Parameters {
  assignmentXref: string
  userXref: string
}

export interface Payload {
  studentId: string
  assignmentId: string
  problemId: string
  session: PartSession
}

export function pluckMessages(messages: Message[]): PartMessage[] {
  const final = []
  for (const message of messages) {
    final.push({
      contents: message.contents,
      createdAt: message.createdAt.getTime(),
      userId: message.user.toString()
    })
  }
  return final
}

export async function buildRequest(
  data: AssistmentsData
): Promise<{ params: Parameters; payload: Payload }> {
  try {
    const params = {
      assignmentXref: data.assignmentId,
      userXref: data.studentId
    }
    const session = await getSessionById(data.session as Types.ObjectId)
    const partSession = {
      createdAt: session.createdAt.getTime(),
      endedAt: session.endedAt.getTime(),
      id: session._id.toString(),
      messages: pluckMessages(session.messages),
      studentId: session.student.toString(),
      subject: session.type,
      subTopic: session.subTopic,
      timeTutored: session.timeTutored,
      volunteerJoinedAt: session.volunteerJoinedAt
        ? session.volunteerJoinedAt.getTime()
        : undefined,
      volunteerId: session.volunteer ? session.volunteer.toString() : undefined
    }
    const payload = {
      studentId: data.studentId,
      assignmentId: data.assignmentId,
      problemId: String(data.problemId),
      session: partSession
    }
    return { params, payload }
  } catch (err) {
    throw new Error(
      `Error building request to send AssistmentsData ${data._id}: ${err.message}`
    )
  }
}

function buildAuthHeader() {
  const parts = config.assistmentsAuthSchema.split('{TOKEN}')
  if (parts.length === 2) return parts[0] + config.assistmentsToken + parts[1]
  throw new Error('Could not build Assistments auth token')
}

export async function sendData(
  params: Parameters,
  payload: Payload
): Promise<void> {
  let status: string
  let message: any
  try {
    const res = await axios.post(
      `${config.assistmentsBaseURL}/assignments/${params.assignmentXref}/exdata/${params.userXref}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: buildAuthHeader()
        },
        validateStatus: () => true // always reolve the promise regardless of status code
      }
    )
    message = res.data
    status = res.status.toString()
  } catch (err) {
    throw new Error(`Retry: ${err.message}`)
  }
  const FAILS = ['401', '403', '404']
  if (status === '201') {
    /* do nothing */
  } else if (FAILS.includes(status))
    throw new Error(status + `: ${JSON.stringify(message)}`)
  else throw new Error(`Retry: ${status}`) // assistments server error
}

export async function sendWrapper(
  params: Parameters,
  payload: Payload
): Promise<void> {
  try {
    await backOff(() => sendData(params, payload), {
      jitter: 'full',
      maxDelay: 2000,
      numOfAttempts: 10,
      retry: (e: any, attemptNumber: number) => {
        log(`AssistmentsData send attempt ${attemptNumber} failed`)
        if (e.message.includes('Retry')) {
          log(e.message)
          return true
        } else {
          log(`Stopping due to status ${e.message}`)
          return false
        }
      }
    })
  } catch (err) {
    throw new Error(
      `Error sending AssistmentsData for session ${payload.session.id}: Used up all attempts to send data`
    )
  }
}

export interface SendAssistmentsDataJobData {
  sessionId: string | Types.ObjectId
}

export default async (job: Job<SendAssistmentsDataJobData>): Promise<void> => {
  const {
    data: { sessionId }
  } = job
  const data = await getBySession(sessionId)
  if (data && !data.sent) {
    const { params, payload } = await buildRequest(data)
    await sendWrapper(params, payload)
    try {
      await updateSentAtById(data._id, new Date())
    } catch (err) {
      throw new Error(
        `Error updating assistments data ${data._id}: ${err.message}`
      )
    }
  }
}
