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

export function getMediaPipelinesClient() {
  if (!mediaPipelinesClient) mediaPipelinesClient = createMediaPipelinesClient()
  return mediaPipelinesClient
}

const createMediaPipelinesClient = (): ChimeSDKMediaPipelinesClient => {
  return new ChimeSDKMediaPipelinesClient({
    region: config.awsChimeRegion,
    credentials: {
      accessKeyId: config.awsChimeAccessKey,
      secretAccessKey: config.awsChimeSecretAccessKey,
    },
  })
}

let mediaPipelinesClient: ChimeSDKMediaPipelinesClient =
  createMediaPipelinesClient()

async function startMediaConcatenation(
  mediaCapturePipelineArn: string,
  meetingId: string
): Promise<string | false> {
  const createConcatPipelineParams: CreateMediaConcatenationPipelineCommandInput =
    {
      Sinks: [
        {
          S3BucketSinkConfiguration: {
            Destination: config.awsChimeMeetingRecordingBucketArn,
          },
          Type: 'S3Bucket',
        },
      ],
      Sources: [
        {
          MediaCapturePipelineSourceConfiguration: {
            ChimeSdkMeetingConfiguration: {
              ArtifactsConfiguration: {
                Audio: { State: 'Enabled' },
                CompositedVideo: { State: 'Enabled' },
                Content: { State: 'Disabled' },
                DataChannel: { State: 'Enabled' },
                MeetingEvents: { State: 'Enabled' },
                TranscriptionMessages: { State: 'Enabled' },
                Video: { State: 'Disabled' },
              },
            },
            MediaPipelineArn: mediaCapturePipelineArn,
          },
          Type: 'MediaCapturePipeline',
        },
      ],
    }
  try {
    const location = await getMediaPipelinesClient().send(
      new CreateMediaConcatenationPipelineCommand(createConcatPipelineParams)
    )
    return location.MediaConcatenationPipeline?.MediaPipelineId ?? false
  } catch (error) {
    logger.error(
      `Creating media pipeline failed for meetingId ${meetingId}: ${error}`
    )
    return false
  }
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
          Resolution: 'FHD',
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
    const createMediaCapturePipelineResponse: CreateMediaCapturePipelineCommandOutput =
      await getMediaPipelinesClient().send(
        new CreateMediaCapturePipelineCommand(createPipelineParams)
      )
    const mediaPipelineArn =
      createMediaCapturePipelineResponse.MediaCapturePipeline?.MediaPipelineArn

    if (mediaPipelineArn) {
      const recordingId = await startMediaConcatenation(
        mediaPipelineArn,
        meetingId
      )
      if (!recordingId) throw new Error('Failed to start media concatenation')

      return recordingId
    } else {
      logger.error(
        'No media pipeline ARN returned from createMediaCapturePipeline'
      )
      throw 'No media pipeline ARN returned from createMediaCapturePipeline'
    }
  } catch (error) {
    logger.error(`Error starting recording for meetingID: ${meetingId}:`, {
      error,
      meetingId,
    })
    throw error
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
