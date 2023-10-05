import { Job } from 'bull'
import { asString, asUlid } from '../../utils/type-utils'
import { log } from '../logger'
import { trackEvent } from '../../services/UserEngagementService'

interface SendDelayedEventData {
  userId: string
  event: string
}

export default async (job: Job<SendDelayedEventData>): Promise<void> => {
  const userId = asUlid(job.data.userId)
  const event = asString(job.data.event)

  try {
    await trackEvent(userId, event)
    log(`Successfully sent ${event} for user ${userId} to Laudspeaker`)
  } catch (error) {
    throw new Error(
      `Failed to send ${event} for user ${userId} to Laudspeaker: ${error}`
    )
  }
}
