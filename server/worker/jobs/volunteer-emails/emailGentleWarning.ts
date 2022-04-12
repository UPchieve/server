import { Job } from 'bull'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { getVolunteersForGentleWarning } from '../../../models/Session'
import { asString } from '../../../utils/type-utils'

interface EmailGentleWarningJobData {
  sessionId: string
}

/**
 *
 * conditions for sending email:
 * - Volunteer received 5 texts and completed 0 tutoring sessions
 *
 */
export default async (job: Job<EmailGentleWarningJobData>): Promise<void> => {
  const { name: currentJob } = job
  const sessionId = asString(job.data.sessionId)
  // replaced by getVolunteersForGentleWarning
  const volunteerWithNotifications = await getVolunteersForGentleWarning(
    sessionId
  )

  if (volunteerWithNotifications.length === 0) return

  const errors = []
  for (const volunteer of volunteerWithNotifications) {
    if (volunteer.totalNotifications === 5) {
      const { firstName, email, id } = volunteer
      try {
        await MailService.sendVolunteerGentleWarning(email, firstName)
        log(`Sent ${currentJob} to volunteer ${id}`)
      } catch (error) {
        errors.push(`volunteer ${id}: ${error}`)
      }
    }
  }
  if (errors.length) {
    throw new Error(`Failed to send ${currentJob} to: ${[errors]}`)
  }
}
