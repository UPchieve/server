import { Job } from 'bull'
import { getSessionById, UserSessionsFilter } from '../../models/Session'
import { asUlid } from '../../utils/type-utils'
import { Ulid } from '../../models/pgUtils'
import {
  generateProgressReportForUser,
  ProgressReport,
} from '../../services/ProgressReportsService'
import { getSocket } from '../sockets'
import { getProgressReportsFeatureFlag } from '../../services/FeatureFlagService'
import config from '../../config'
import axios from 'axios'
import { logError } from '../logger'

export type ProcessedProgressReportData = {
  userId: Ulid
  report: Partial<ProgressReport>
} & UserSessionsFilter

export async function sendProgressReportProcessed(
  data: ProcessedProgressReportData
) {
  try {
    const protocol = config.NODE_ENV === 'production' ? 'https' : 'http'
    // Include port for non-production environment
    const port = config.NODE_ENV === 'production' ? '' : config.apiPort
    await axios.post(
      `${protocol}://${config.host}${port}/api/processed-reports/processed`,
      data
    )
  } catch (err) {
    logError(err as Error)
  }
}

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
    const data = {
      userId: userId,
      ...reportOptions,
      report,
    }
    if (socket.connected) socket.emit('progress-report:processed', data)
    else await sendProgressReportProcessed(data)
  } catch (error) {
    // TODO: fix type
    const report = ({
      status: 'error',
      summary: {},
      topics: [],
      id: '',
    } as unknown) as ProgressReport
    const data = {
      userId: userId,
      ...reportOptions,
      report,
    }
    if (socket.connected) socket.emit('progress-report:processed', data)
    else await sendProgressReportProcessed(data)
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
