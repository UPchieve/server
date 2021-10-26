import { Job } from 'bull'
import { Types } from 'mongoose'
import logger from '../../../logger'
import * as MailService from '../../../services/MailService'
import { getVolunteerForOnboardingById } from '../../../models/Volunteer/queries'
import { Jobs } from '../index'

interface OnboardingReminder {
  volunteerId: Types.ObjectId
}

export default async (job: Job<OnboardingReminder>): Promise<void> => {
  const {
    data: { volunteerId },
    name: currentJob
  } = job
  const volunteer = await getVolunteerForOnboardingById(volunteerId)

  if (volunteer) {
    try {
      let delay = 0
      let nextJob = ''
      const { firstname, email } = volunteer
      if (currentJob === Jobs.EmailOnboardingReminderOne) {
        const hasCompletedUpchieve101 =
          volunteer.certifications.upchieve101.passed
        const hasUnlockedASubject = volunteer.subjects.length > 0
        const hasSelectedAvailability = !!volunteer.availabilityLastModifiedAt
        const hasCompletedBackgroundInfo = !!volunteer.country

        // Volunteer has not completed onboarding 7 days after creating  account
        await MailService.sendOnboardingReminderOne(
          firstname,
          email,
          hasCompletedBackgroundInfo,
          hasCompletedUpchieve101,
          hasUnlockedASubject,
          hasSelectedAvailability
        )
        delay = 1000 * 60 * 60 * 24 * 7
        nextJob = Jobs.EmailOnboardingReminderTwo
      }

      if (currentJob === Jobs.EmailOnboardingReminderTwo) {
        // Volunteer has not completed onboarding 7 days after sending onboarding reminder one
        await MailService.sendOnboardingReminderTwo(email, firstname)
        delay = 1000 * 60 * 60 * 24 * 10
        nextJob = Jobs.EmailOnboardingReminderThree
      }

      if (currentJob === Jobs.EmailOnboardingReminderThree) {
        // Volunteer has not completed onboarding 10 days after sending onboarding reminder two
        await MailService.sendOnboardingReminderThree(email, firstname)
      }
      logger.info(`Emailed ${currentJob} to volunteer ${volunteerId}`)
      if (nextJob) job.queue.add(nextJob, { volunteerId }, { delay })
    } catch (error) {
      throw new Error(
        `Failed to email ${currentJob} to volunteer ${volunteerId}: ${error}`
      )
    }
  }
}
