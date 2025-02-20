import {
  ChimeSDKMeetingsClient,
  StartMeetingTranscriptionCommand,
  StopMeetingTranscriptionCommand,
} from '@aws-sdk/client-chime-sdk-meetings'
import logger from '../logger'

import config from '../config'

export function getClient() {
  if (!client) client = createClient()
  return client
}

const createClient = (): ChimeSDKMeetingsClient => {
  return new ChimeSDKMeetingsClient({
    region: config.awsChimeRegion,
    credentials: {
      accessKeyId: config.awsChimeAccessKey,
      secretAccessKey: config.awsChimeSecretAccessKey,
    },
  })
}

let client: ChimeSDKMeetingsClient = createClient()

export async function startTranscription(meetingId: string) {
  try {
    const transcribeResponse = await getClient().send(
      new StartMeetingTranscriptionCommand({
        MeetingId: meetingId,
        TranscriptionConfiguration: {
          EngineTranscribeSettings: {
            LanguageCode: 'en-US',
          },
        },
      })
    )
    return transcribeResponse.$metadata.httpStatusCode === 200
  } catch (error) {
    logger.error(`Error starting transcription for meetingID: ${meetingId}:`, {
      error,
      meetingId,
    })
    return false
  }
}

export async function stopTranscription(meetingId: string) {
  try {
    await getClient().send(
      new StopMeetingTranscriptionCommand({
        MeetingId: meetingId,
      })
    )
  } catch (error) {
    logger.error('Error stopping transcription:', error)
  }
}
