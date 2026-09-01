import { Job } from 'bull'
import { log } from '../../logger'
import * as EssayReviewService from '../../../services/EssayReviewService'
import * as MailService from '../../../services/MailService'
import {
  getVolunteerContactInfoByIds,
  getVolunteerSubjects,
} from '../../../models/Volunteer/queries'
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
  const submission = await EssayReviewService.getEssayReviewSubmission(
    job.data.submissionId
  )
  const volunteerIds =
    await EssayReviewService.getEssayReviewEmailOptedInVolunteerIds()
  if (!volunteerIds.length) return

  const enabledVolunteerIds: Uuid[] = []
  for (const volunteerId of volunteerIds) {
    const [reviewEnabled, notificationsEnabled, subjects] = await Promise.all([
      FeatureFlagService.isVolunteerAsyncEssayReviewEnabled(volunteerId),
      FeatureFlagService.isAsyncEssayReviewEmailNotificationsEnabled(
        volunteerId
      ),
      getVolunteerSubjects(volunteerId),
    ])
    if (
      reviewEnabled &&
      notificationsEnabled &&
      subjects.some((subject) => subject.name === submission.subject)
    ) {
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
        subject: submission.subject,
      })
      AnalyticsService.captureEvent(
        volunteer.id,
        EVENTS.VOLUNTEER_NOTIFIED_ABOUT_ESSAY_REVIEW_SUBMISSION,
        { submissionId: job.data.submissionId, subject: submission.subject }
      )
      notifiedCount++
    } catch {
      failedVolunteerIds.push(volunteer.id)
    }
  }

  log(
    `${Jobs.NotifyVolunteersAboutEssayReviewSubmission}: Notified ${notifiedCount} volunteers about submission ${job.data.submissionId}`
  )

  if (failedVolunteerIds.length) {
    log(
      `${Jobs.NotifyVolunteersAboutEssayReviewSubmission}: Failed to notify ${failedVolunteerIds.length} opted-in volunteers about submission ${job.data.submissionId}: ${failedVolunteerIds.join(', ')}`
    )
  }
}
