import { ChimeSDKMeetingsClient } from '@aws-sdk/client-chime-sdk-meetings'

export function getClient() {
  if (!client) client = createClient()
  return client
}

const createClient = (): ChimeSDKMeetingsClient => {
  return new ChimeSDKMeetingsClient({
    region: 'us-east-1',
  })
}

let client: ChimeSDKMeetingsClient = createClient()
