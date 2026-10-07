import { Job } from 'bull'
import { log } from '../logger'
import { Uuid } from '../../models/pgUtils'
import { generateSessionSummaryForSession } from '../../services/SessionSummariesService'
import { asString } from '../../utils/type-utils'

type GenerateSessionSummary = {
  sessionId: Uuid
}

export default async (job: Job<GenerateSessionSummary>): Promise<void> => {
  const sessionId = asString(job.data.sessionId)

  try {
    await generateSessionSummaryForSession(sessionId)
    log(`Successfully generated summaries for session ${sessionId}`)
  } catch (error) {
    throw new Error(
      `Failed to generate summaries for session ${sessionId}. Error: ${error}`
    )
  }
}
