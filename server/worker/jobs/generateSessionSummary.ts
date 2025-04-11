import { Job } from 'bull'
import { log } from '../logger'
import { Uuid } from '../../models/pgUtils'
import { getSessionById } from '../../models/Session'
import { getGenerateSessionSummaryFeatureFlag } from '../../services/FeatureFlagService'
import { generateSessionSummaryForSession } from '../../services/SessionSummariesService'
import { asString } from '../../utils/type-utils'

type GenerateSessionSummary = {
  sessionId: Uuid
}

export default async (job: Job<GenerateSessionSummary>): Promise<void> => {
  const sessionId = asString(job.data.sessionId)
  const session = await getSessionById(sessionId)
  if (!(await getGenerateSessionSummaryFeatureFlag(session.studentId))) return

  try {
    await generateSessionSummaryForSession(session.id)
    log(`Successfully generated summaries for session ${session.id}`)
  } catch (error) {
    throw new Error(
      `Failed to generate summaries for session ${session.id}. Error: ${error}`
    )
  }
}
