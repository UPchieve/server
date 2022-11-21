import { Job } from 'bull'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { getVolunteerForOnboardingById } from '../../../models/Volunteer/queries'
import { Jobs } from '../index'
import { asString } from '../../../utils/type-utils'

interface OnboardingReminder {
  volunteerId: string
}

export default async (job: Job<OnboardingReminder>): Promise<void> => {
  const { name: currentJob } = job
  const volunteerId = asString(job.data.volunteerId)
  const volunteer = await getVolunteerForOnboardingById(volunteerId)

  if (volunteer) {
    try {
      let delay = 0
      let nextJob = ''
      const { firstName, email } = volunteer
      if (currentJob === Jobs.EmailOnboardingReminderOne) {
        const hasUnlockedASubject = volunteer.subjects.length > 0
        const hasSelectedAvailability = !!volunteer.availabilityLastModifiedAt
        const hasCompletedBackgroundInfo = !!volunteer.country

        // Volunteer has not completed onboarding 7 days after creating  account
        await MailService.sendOnboardingReminderOne(
          firstName,
          email,
          hasCompletedBackgroundInfo,
          volunteer.hasCompletedUpchieve101,
          hasUnlockedASubject,
          hasSelectedAvailability
        )
        delay = 1000 * 60 * 60 * 24 * 7
        nextJob = Jobs.EmailOnboardingReminderTwo
      }

      if (currentJob === Jobs.EmailOnboardingReminderTwo) {
        // Volunteer has not completed onboarding 7 days after sending onboarding reminder one
        await MailService.sendOnboardingReminderTwo(email, firstName)
        delay = 1000 * 60 * 60 * 24 * 10
        nextJob = Jobs.EmailOnboardingReminderThree
      }

      if (currentJob === Jobs.EmailOnboardingReminderThree) {
        // Volunteer has not completed onboarding 10 days after sending onboarding reminder two
        await MailService.sendOnboardingReminderThree(email, firstName)
      }
      log(`Emailed ${currentJob} to volunteer ${volunteerId}`)
      if (nextJob)
        job.queue.add(
          nextJob,
          { volunteerId: volunteerId.toString() },
          { delay, removeOnComplete: true, removeOnFail: true }
        )
    } catch (error) {
      throw new Error(
        `Failed to email ${currentJob} to volunteer ${volunteerId}: ${error}`
      )
    }
  }
}
