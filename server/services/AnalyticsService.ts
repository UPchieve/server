import { client } from '../posthog'
import { Ulid } from '../models/pgUtils'

export const captureEvent = (
  userId: Ulid,
  eventName: string,
  eventProperties?: { [key: string]: any },
  userProperties?: { [key: string]: string | number | boolean }
): void => {
  const properties = {
    ...eventProperties,
    $set: userProperties,
  }
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
