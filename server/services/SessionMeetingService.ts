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
import { getClient, runInTransaction, TransactionClient } from '../db'
import { LookupError } from '../models/Errors'
export async function getOrCreateSessionMeeting(
  sessionId: string,
  userId: string,
  transactionClient?: TransactionClient
): Promise<{
  meeting: Meeting
  attendee: Attendee
}> {
  return runInTransaction(async (tc: TransactionClient) => {
    // Get existing meeting if it exists
    let meeting: Meeting
    let attendee: Attendee
    const existingMeeting = await SessionMeetingsRepo.getSessionMeetingBySessionId(
      sessionId,
      tc
    )
    // If no existing meeting, create a new one and a new attendee, and return these.
    if (!existingMeeting) {
      const created = await createMeetingWithAttendee({ sessionId, userId })
      meeting = created.meeting
      attendee = created.attendee
      await SessionMeetingsRepo.insertSessionMeeting(
        sessionId,
        meeting.MeetingId!,
        'chime',
        tc
      )
    } else {
      // If there is an existing meeting, check if it includes userId in the attendees.
      // If not, create one, and return these.
      meeting = await getMeeting({
        meetingId: existingMeeting.externalId,
        sessionId,
      })
      attendee = await getOrCreateAttendee({
        userId,
        meetingId: existingMeeting.externalId,
        sessionId,
      })
    }

    return { meeting, attendee }
  }, transactionClient ?? getClient())
}

async function createAttendee(
  userId: string,
  sessionId: string,
  meetingId: string
): Promise<Attendee> {
  const client = AwsChimeService.getClient()
  const created = await client.send<
    CreateAttendeeCommandInput,
    CreateAttendeeCommandOutput
  >(
    new CreateAttendeeCommand({
      ExternalUserId: userId,
      MeetingId: meetingId,
    })
  )
  if (!created.Attendee)
    throw new Error(
      { sessionId, userId, meetingId },
      'Failed to create attendee for meeting'
    )
  return created.Attendee
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
      { meetingId, sessionId },
      `Failed to fetch meeting with given ID for session`
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
      ExternalUserId: userId,
    })
  )
  if (!createdAttendee.Attendee)
    throw new Error(
      {
        sessionId,
        userId,
        meetingId,
      },
      `Failed to create new attendee`
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
      { sessionId, userId },
      'Failed to create meeting and attendees'
    )
  return {
    meeting: created.Meeting,
    attendee: created.Attendees[0],
  }
}

export async function endSessionMeeting(sessionId: string) {
  const existingMeeting = await SessionMeetingsRepo.getSessionMeetingBySessionId(
    sessionId
  )
  if (!existingMeeting)
    throw new LookupError(
      `Cannot end session meeting: No meeting exists for session ${sessionId}`
    )

  const client = AwsChimeService.getClient()
  await client.send<DeleteMeetingCommandInput, DeleteMeetingCommandOutput>(
    new DeleteMeetingCommand({
      MeetingId: existingMeeting.externalId,
    })
  )
}
