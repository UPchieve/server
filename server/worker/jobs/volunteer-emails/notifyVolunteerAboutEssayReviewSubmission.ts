import { Job } from 'bull'
import { log } from '../../logger'
import * as EssayReviewService from '../../../services/EssayReviewService'
import * as MailService from '../../../services/MailService'
import { getVolunteerContactInfoByIds } from '../../../models/Volunteer/queries'
import * as FeatureFlagService from '../../../services/FeatureFlagService'
import * as AnalyticsService from '../../../services/AnalyticsService'
import { EVENTS } from '../../../constants'
import type { Uuid } from '../../../types/shared'
import { Jobs } from '..'

type NotifyVolunteersAboutEssayReviewSubmissionJobData = {
  submissionId: Uuid
}

export default async function notifyVolunteersAboutEssayReviewSubmission(
  job: Job<NotifyVolunteersAboutEssayReviewSubmissionJobData>
): Promise<void> {
  const volunteerIds =
    await EssayReviewService.getEssayReviewEmailOptedInVolunteerIds()
  if (!volunteerIds.length) return

  const enabledVolunteerIds: Uuid[] = []
  for (const volunteerId of volunteerIds) {
    const [reviewEnabled, notificationsEnabled] = await Promise.all([
      FeatureFlagService.isVolunteerAsyncEssayReviewEnabled(volunteerId),
      FeatureFlagService.isAsyncEssayReviewEmailNotificationsEnabled(
        volunteerId
      ),
    ])
    if (reviewEnabled && notificationsEnabled) {
      enabledVolunteerIds.push(volunteerId)
    }
  }
  if (!enabledVolunteerIds.length) return

  const volunteers = await getVolunteerContactInfoByIds(enabledVolunteerIds)
  let notifiedCount = 0
  const failedVolunteerIds: Uuid[] = []

  for (const volunteer of volunteers) {
    try {
      await MailService.notifyVolunteerAboutEssayReviewSubmission({
        volunteerEmail: volunteer.email,
        volunteerFirstName: volunteer.firstName,
      })
      AnalyticsService.captureEvent(
        volunteer.id,
        EVENTS.VOLUNTEER_NOTIFIED_ABOUT_ESSAY_REVIEW_SUBMISSION,
        { submissionId: job.data.submissionId }
      )
      notifiedCount++
    } catch {
      failedVolunteerIds.push(volunteer.id)
    }
  }

  log(
    `${Jobs.NotifyVolunteersAboutEssayReviewSubmission}: Notified ${notifiedCount} volunteers about essay ${job.data.submissionId}`
  )

  if (failedVolunteerIds.length) {
    log(
      `${Jobs.NotifyVolunteersAboutEssayReviewSubmission}: Failed to notify ${failedVolunteerIds.length} opted-in volunteers about essay ${job.data.submissionId}: ${failedVolunteerIds.join(', ')}`
    )
  }
}
