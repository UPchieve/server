import { Job } from 'bull'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { getSessionsVolunteerRating } from '../../../models/Session'
import { getVolunteerContactInfoById } from '../../../models/Volunteer'
import { asString } from '../../../utils/type-utils'
import { getFullVolunteerPartnerOrgByKey } from '../../../models/VolunteerPartnerOrg'

/**
 *
 * conditions for sending the email:
 * - partner volunteer who has had 5 sessions
 * - each session must be 15+ minutes long and must have a session flag for an absent user
 * - must have not left 2 ratings of 1 - 3 session ratings
 *
 */

interface EmailReferCoworkerJobData {
  volunteerId: string
}

export default async (job: Job<EmailReferCoworkerJobData>): Promise<void> => {
  const currentJob = job.name
  const volunteerId = asString(job.data.volunteerId)
  const volunteer = await getVolunteerContactInfoById(volunteerId)
  // Do not send email if volunteer does not match email recipient spec
  if (!volunteer || !volunteer.volunteerPartnerOrg) return

  const sessions = await getSessionsVolunteerRating(volunteerId)

  if (sessions.length === 5) {
    let totalLowSessionRatings = 0
    const lowSessionRating = 3
    const totalLowSessionRatingsLimit = 2
    for (const session of sessions) {
      if (
        typeof session.sessionRating === 'number' &&
        session.sessionRating <= lowSessionRating
      )
        totalLowSessionRatings++
    }

    if (totalLowSessionRatings >= totalLowSessionRatingsLimit) return

    try {
      await MailService.sendPartnerVolunteerReferACoworker(
        volunteer.email,
        volunteer.firstName,
        volunteer.volunteerPartnerOrg,
        (await getFullVolunteerPartnerOrgByKey(volunteer.volunteerPartnerOrg))
          .name
      )
      log(`Sent ${currentJob} to volunteer ${volunteerId}`)
    } catch (error) {
      throw new Error(
        `Failed to send ${currentJob} to volunteer ${volunteerId}: ${error}`
      )
    }
  }
}
