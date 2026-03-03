import {
  ChimeSDKMeetingsClient,
  StartMeetingTranscriptionCommand,
  StopMeetingTranscriptionCommand,
} from '@aws-sdk/client-chime-sdk-meetings'
import {
  ChimeSDKMediaPipelinesClient,
  CreateMediaCapturePipelineCommand,
  CreateMediaCapturePipelineCommandInput,
  CreateMediaCapturePipelineCommandOutput,
  CreateMediaConcatenationPipelineCommand,
  CreateMediaConcatenationPipelineCommandInput,
} from '@aws-sdk/client-chime-sdk-media-pipelines'
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
const mediaPipelinesClient: ChimeSDKMediaPipelinesClient =
  createMediaPipelinesClient()
function createMediaPipelinesClient(): ChimeSDKMediaPipelinesClient {
  return new ChimeSDKMediaPipelinesClient({
    region: config.awsChimeRegion,
    credentials: {
      accessKeyId: config.awsChimeAccessKey,
      secretAccessKey: config.awsChimeSecretAccessKey,
    },
  })
}

export async function startRecording(meetingId: string): Promise<string> {
  const createPipelineParams: CreateMediaCapturePipelineCommandInput = {
    ChimeSdkMeetingConfiguration: {
      ArtifactsConfiguration: {
        Audio: { MuxType: 'AudioOnly' },
        CompositedVideo: {
          GridViewConfiguration: {
            ContentShareLayout: 'PresenterOnly',
          },
          Layout: 'GridView',
          Resolution: 'HD',
        },
        Content: { State: 'Disabled' },
        Video: { State: 'Disabled' },
      },
    },
    SinkArn: config.awsChimeMeetingRecordingBucketArn,
    SinkType: 'S3Bucket',
    SourceArn: `arn:aws:chime::${config.awsAccountId}:meeting:${meetingId}`,
    SourceType: 'ChimeSdkMeeting',
    Tags: [{ Key: 'transcription-for-comprehend', Value: 'true' }],
  }
  try {
    const response: CreateMediaCapturePipelineCommandOutput =
      await mediaPipelinesClient.send(
        new CreateMediaCapturePipelineCommand(createPipelineParams)
      )
    const mediaPipelineId = response.MediaCapturePipeline?.MediaPipelineId
    if (!mediaPipelineId) {
      throw new Error('Error starting recording for Chime Meeting')
    }
    return mediaPipelineId
  } catch (err) {
    logger.error(
      {
        err,
        meetingId,
      },
      `Error starting recording for Chime meeting`
    )
    throw err
  }
}

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
