import { Job } from 'bull'
import logger from '../../../logger'
import { sendNthsEngagementEmail } from '../../../services/MailService'
import { createEmailNotification } from '../../../services/NotificationService'
import * as NthsApplicationRepo from '../../../models/NTHSApplication'
import config from '../../../config'

type JobData = {
  cohortStartDate: Date
  cohortEndDate: Date
}

export default async function (job: Job<JobData>) {
  const engagementEmailsConfig = [
    {
      emailType: '3_day',
      templateId: config.sendgrid.nthsCandidateEngagment.day3,
      label: '3 day',
    },

    {
      emailType: '5_day',
      templateId: config.sendgrid.nthsCandidateEngagment.day5,
      label: '5 day',
    },

    {
      emailType: '8_day',
      templateId: config.sendgrid.nthsCandidateEngagment.day8,
      label: '8 day',
    },

    {
      emailType: '12_day',
      templateId: config.sendgrid.nthsCandidateEngagment.day12,
      label: '12 day',
    },
  ] as const

  const cohortStartDate = new Date(job.data.cohortStartDate)
  const cohortEndDate = new Date(job.data.cohortEndDate)

  const candidates = await NthsApplicationRepo.needsEngagementEmail({
    cohortEndDate,
    cohortStartDate,
    day3TemplateId: config.sendgrid.nthsCandidateEngagment.day3,
    day5TemplateId: config.sendgrid.nthsCandidateEngagment.day5,
    day8TemplateId: config.sendgrid.nthsCandidateEngagment.day8,
    day12TemplateId: config.sendgrid.nthsCandidateEngagment.day12,
  })

  logger.info(
    { candidatesCount: candidates.length },
    'Found nths candidates needing engagement'
  )

  for (const { emailType, label, templateId } of engagementEmailsConfig) {
    const engagements = candidates.filter(
      (candidates) => candidates.emailType === emailType
    )

    if (engagements.length) {
      await sendNthsEngagementEmail(engagements, templateId)
      for (const applicant of engagements) {
        await createEmailNotification({
          userId: applicant.userId,
          emailTemplateId: templateId,
        })
      }
      logger.info(
        { candidatesCount: engagements.length },
        `Sent ${label} engagement to nths candidates`
      )
    }
  }
}
