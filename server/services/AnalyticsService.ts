import PostHog from 'posthog-node'
import { Types } from 'mongoose'
import config from '../config'
import { UserBindingContext } from 'twilio/lib/rest/chat/v2/service/user/userBinding'

const client = new PostHog(config.posthogToken, {
  host: 'https://app.posthog.com',
})

export const captureEvent = (
  userId: Types.ObjectId,
  eventName: string,
  properties: {
    event: string
    sessionId?: string
    subject?: string
    referenceEmail?: string
    banReason?: string
    joinedFrom?: string
    schoolPartner?: string
    nonProfitPartner?: string
    partner?: string
  }
): void => {
  client.capture({
    distinctId: userId.toString(),
    event: eventName,
    properties,
  })
}

export function identify(
  userId: Types.ObjectId,
  properties: {
    schoolPartner?: string
    nonProfitPartner?: string
  }
) {
  client.identify({
    distinctId: userId.toString(),
    properties,
  })
}
