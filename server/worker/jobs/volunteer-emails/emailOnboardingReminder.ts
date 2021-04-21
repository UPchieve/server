import { Job } from 'bull'
import { Types } from 'mongoose'
import logger from '../../../logger'
import MailService from '../../../services/MailService'
import { getVolunteer } from '../../../services/UserService'
import { Jobs } from '../index'

interface OnboardingReminder {
  volunteerId: string | Types.ObjectId
}

export default async (job: Job<OnboardingReminder>): Promise<void> => {
  const {
    data: { volunteerId },
    name: currentJob
  } = job
  const volunteer = await getVolunteer(
    {
      _id: volunteerId,
      isDeactivated: false,
      isOnboarded: false
    },
    {
      _id: 1,
      email: 1,
      firstname: 1,
      isOnboarded: 1,
      certifications: 1,
      subjects: 1,
      availabilityLastModifiedAt: 1,
      country: 1
    }
  )

  if (volunteer) {
    try {
      let delay = 0
      let nextJob = ''
      const { firstname: firstName, email } = volunteer
      const contactInfo = { firstName, email }
      if (currentJob === Jobs.EmailOnboardingReminderOne) {
        const hasCompletedUpchieve101 =
          volunteer.certifications.upchieve101.passed
        const hasUnlockedASubject = volunteer.subjects.length > 0
        const hasSelectedAvailability = volunteer.availabilityLastModifiedAt
        const hasCompletedBackgroundInfo = volunteer.country

        // Volunteer has not completed onboarding 7 days after creating  account
        await MailService.sendOnboardingReminderOne({
          ...contactInfo,
          hasCompletedBackgroundInfo,
          hasCompletedUpchieve101,
          hasUnlockedASubject,
          hasSelectedAvailability
        })
        delay = 1000 * 60 * 60 * 24 * 7
        nextJob = Jobs.EmailOnboardingReminderTwo
      }

      if (currentJob === Jobs.EmailOnboardingReminderTwo) {
        // Volunteer has not completed onboarding 7 days after sending onboarding reminder one
        await MailService.sendOnboardingReminderTwo(contactInfo)
        delay = 1000 * 60 * 60 * 24 * 10
        nextJob = Jobs.EmailOnboardingReminderThree
      }

      if (currentJob === Jobs.EmailOnboardingReminderThree) {
        // Volunteer has not completed onboarding 10 days after sending onboarding reminder two
        await MailService.sendOnboardingReminderThree(contactInfo)
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
