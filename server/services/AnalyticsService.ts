import PostHog from 'posthog-node'
import { Types } from 'mongoose'
import config from '../config'

const client = new PostHog(config.posthogToken, {
  host: 'https://app.posthog.com',
})

export const captureEvent = (
  userId: Types.ObjectId,
  eventName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: {
    event: string
    sessionId?: string
    subject?: string
    referenceEmail?: string
    banReason?: string
    joinedFrom?: string
  }
): void => {
  client.capture({
    distinctId: userId.toString(),
    event: eventName,
    properties,
  })
}

module.exports = {
  captureEvent,
}
