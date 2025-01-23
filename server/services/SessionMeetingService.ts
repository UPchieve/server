import * as SessionMeetingsRepo from '../models/SessionMeeting/queries'
import * as AwsChimeService from './AwsChimeService'
import {
  Attendee,
  CreateAttendeeCommand,
  CreateAttendeeCommandInput,
  CreateAttendeeCommandOutput,
  CreateAttendeeRequestItem,
  CreateMeetingWithAttendeesCommand,
  CreateMeetingWithAttendeesCommandInput,
  CreateMeetingWithAttendeesCommandOutput,
  DeleteMeetingCommand,
  DeleteMeetingCommandInput,
  DeleteMeetingCommandOutput,
  GetMeetingCommand,
  GetMeetingCommandInput,
  GetMeetingCommandOutput,
  ListAttendeesCommand,
  ListAttendeesCommandInput,
  ListAttendeesCommandOutput,
  Meeting,
} from '@aws-sdk/client-chime-sdk-meetings'
import { getClient, TransactionClient } from '../db'
import { LookupError, RepoCreateError } from '../models/Errors'
import logger from '../logger'
import { SessionMeeting } from '../models/SessionMeeting'

export type SessionMeetingWithAttendee = {
  meeting: Meeting
  attendee: Attendee
}

async function handleExistingMeeting({
  existingMeeting,
  sessionId,
  userId,
}: {
  existingMeeting: SessionMeeting
  sessionId: string
  userId: string
}): Promise<SessionMeetingWithAttendee> {
  // If there is an existing meeting, check if it includes userId in the attendees.
  // If not, create one, and return these.
  const meeting = await getMeeting({
    meetingId: existingMeeting.externalId,
    sessionId,
  })
  const attendee = await getOrCreateAttendee({
    userId,
    meetingId: existingMeeting.externalId,
    sessionId,
  })
  return { meeting, attendee }
}

async function handleNoExistingMeeting(
  tc: TransactionClient,
  {
    sessionId,
    userId,
  }: {
    sessionId: string
    userId: string
  }
): Promise<SessionMeetingWithAttendee> {
  const created = await createMeetingWithAttendee({ sessionId, userId })
  const meeting = created.meeting
  const attendee = created.attendee

  try {
    await SessionMeetingsRepo.insertSessionMeeting(
      sessionId,
      meeting.MeetingId!,
      'chime',
      tc
    )
    return { meeting, attendee }
  } catch (err) {
    if (err instanceof RepoCreateError) {
      const sessionMeeting = await handleInsertSessionMeetingFailure(tc, {
        sessionId,
        externalMeetingId: meeting.ExternalMeetingId!,
      })

      return handleExistingMeeting({
        existingMeeting: sessionMeeting,
        sessionId,
        userId,
      })
    } else {
      throw err
    }
  }
}

async function handleInsertSessionMeetingFailure(
  tc: TransactionClient,
  {
    externalMeetingId,
    sessionId,
  }: {
    externalMeetingId: string
    sessionId: string
  }
): Promise<SessionMeeting> {
  logger.warn(
    `Failed to create session_meeting for session ${sessionId}. Now attempting to fetch it`
  )
  // Sometimes the student and volunteer enter a race condition both trying to
  // create the meeting at the same time. If this happens, fetch the meeting again
  await deleteChimeMeeting(externalMeetingId)
  const mtg = await SessionMeetingsRepo.getSessionMeetingBySessionId(
    sessionId,
    tc
  )
  if (!mtg)
    throw new Error(
      `Failed to create or fetch session_meeting for session ${sessionId}`
    )
  return mtg
}

export async function getOrCreateSessionMeeting(
  sessionId: string,
  userId: string,
  transactionClient?: TransactionClient
): Promise<SessionMeetingWithAttendee> {
  const client = transactionClient ?? getClient()
  // Get existing meeting if it exists
  let existingMeeting = await SessionMeetingsRepo.getSessionMeetingBySessionId(
    sessionId,
    client
  )
  if (existingMeeting) {
    return await handleExistingMeeting({ existingMeeting, userId, sessionId })
  } else {
    return await handleNoExistingMeeting(client, { sessionId, userId })
  }
}
async function getMeeting({
  meetingId,
  sessionId,
}: {
  meetingId: string
  sessionId: string
}): Promise<Meeting> {
  const client = AwsChimeService.getClient()
  const meeting = await client.send<
    GetMeetingCommandInput,
    GetMeetingCommandOutput
  >(
    new GetMeetingCommand({
      MeetingId: meetingId,
    })
  )
  if (!meeting.Meeting)
    throw new Error(
      `Failed to fetch meeting ${meetingId} of session ${sessionId}`
    )
  return meeting.Meeting
}

async function getOrCreateAttendee({
  sessionId,
  meetingId,
  userId,
}: {
  userId: string
  meetingId: string
  sessionId: string
}): Promise<Attendee> {
  const client = AwsChimeService.getClient()
  const attendees = await client.send<
    ListAttendeesCommandInput,
    ListAttendeesCommandOutput
  >(
    new ListAttendeesCommand({
      MeetingId: meetingId,
    })
  )
  const thisAttendee = (attendees.Attendees ?? []).find(
    a => a.ExternalUserId === userId
  )
  if (thisAttendee) return thisAttendee
  const createdAttendee = await client.send<
    CreateAttendeeCommandInput,
    CreateAttendeeCommandOutput
  >(
    new CreateAttendeeCommand({
      MeetingId: meetingId,
      ExternalUserId: userId,
    })
  )
  if (!createdAttendee.Attendee)
    throw new Error(
      `Failed to create new attendee for user ${userId} for meeting ${meetingId} of session ${sessionId}`
    )
  return createdAttendee.Attendee
}
async function createMeetingWithAttendee({
  sessionId,
  userId,
}: {
  sessionId: string
  userId: string
}): Promise<{ meeting: Meeting; attendee: Attendee }> {
  const client = AwsChimeService.getClient()
  const createMeetingReq = {
    MediaRegion: 'us-east-1',
    ExternalMeetingId: sessionId,
  }
  const createAttendeeReq = {
    Attendees: [
      {
        ExternalUserId: userId,
      } as CreateAttendeeRequestItem,
    ],
  }

  const created = await client.send<
    CreateMeetingWithAttendeesCommandInput,
    CreateMeetingWithAttendeesCommandOutput
  >(
    new CreateMeetingWithAttendeesCommand({
      ...createMeetingReq,
      ...createAttendeeReq,
    })
  )
  if (!created.Meeting || !created.Attendees?.length)
    throw new Error(
      `Failed to create meeting for session ${sessionId} and attendee for user ${userId}`
    )
  return {
    meeting: created.Meeting,
    attendee: created.Attendees[0],
  }
}

export async function endMeeting(sessionId: string) {
  const existingMeeting = await SessionMeetingsRepo.getSessionMeetingBySessionId(
    sessionId
  )
  if (!existingMeeting)
    throw new LookupError(
      `Cannot end session meeting: No meeting exists for session ${sessionId}`
    )

  await deleteChimeMeeting(existingMeeting.externalId)
}

async function deleteChimeMeeting(meetingId: string) {
  const client = AwsChimeService.getClient()
  await client.send<DeleteMeetingCommandInput, DeleteMeetingCommandOutput>(
    new DeleteMeetingCommand({
      MeetingId: meetingId,
    })
  )
}
