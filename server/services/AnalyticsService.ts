import { client } from '../posthog'
import { Ulid } from '../models/pgUtils'

export const captureEvent = (
  userId: Ulid,
  eventName: string,
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

export type IdentifyProperties = {
  schoolPartner?: string
  partner?: string
  userType?: string
}

export function identify(userId: Ulid, properties: IdentifyProperties) {
  client.identify({
    distinctId: userId.toString(),
    properties,
  })
}
