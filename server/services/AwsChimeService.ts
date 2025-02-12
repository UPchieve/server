import { ChimeSDKMeetingsClient } from '@aws-sdk/client-chime-sdk-meetings'
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
