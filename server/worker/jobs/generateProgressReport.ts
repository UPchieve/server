import { Job } from 'bull'
import { getSessionById, UserSessionsFilter } from '../../models/Session'
import { asUlid } from '../../utils/type-utils'
import { Ulid } from '../../models/pgUtils'
import { generateProgressReportForUser } from '../../services/ProgressReportsService'
import { getSocket } from '../sockets'
import { getProgressReportsFeatureFlag } from '../../services/FeatureFlagService'
import config from '../../config'

interface GenerateProgressReport {
  sessionId: Ulid
}

async function generateAndEmitProgressReport(
  userId: Ulid,
  reportOptions: UserSessionsFilter
) {
  const socket = getSocket()
  try {
    const report = await generateProgressReportForUser(userId, reportOptions)
    socket.emit('progress-report:processed', {
      userId: userId,
      ...reportOptions,
      report,
    })
  } catch (error) {
    socket.emit('progress-report:processed', {
      userId: userId,
      ...reportOptions,
      report: {
        status: 'error',
        summary: {},
        topics: [],
      },
    })
    throw error
  }
}

export default async (job: Job<GenerateProgressReport>): Promise<void> => {
  const sessionId = asUlid(job.data.sessionId)
  const session = await getSessionById(sessionId)
  const isProgressReportsActive = await getProgressReportsFeatureFlag(
    session.studentId
  )
  if (
    session.subject !== 'reading' ||
    !isProgressReportsActive ||
    session.timeTutored < config.minSessionLength
  )
    return
  const tasks = [
    // Single session analysis
    generateAndEmitProgressReport(session.studentId, {
      sessionId: session.id,
      subject: session.subject,
    }),
    // Group session analysis
    generateAndEmitProgressReport(session.studentId, {
      subject: session.subject,
    }),
  ]

  // Execute both generation tasks in parallel
  const results = await Promise.allSettled(tasks)
  const errors = results
    .filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    )
    .map(
      (result, i) =>
        `Error in ${i === 0 ? 'single' : 'group'} session report: ${
          result.reason
        }`
    )

  if (errors.length) {
    throw new Error(errors.join('\n'))
  }
}
