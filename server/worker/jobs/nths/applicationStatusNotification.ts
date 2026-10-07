import { Job } from 'bull'
import logger from '../../../logger'
import {
  sendNTHSCandidateApplicationApproved,
  sendNTHSCandidateApplicationDenied,
} from '../../../services/MailService'
import { createEmailNotification } from '../../../services/NotificationService'
import * as NthsApplicationRepo from '../../../models/NTHSApplication'
import config from '../../../config'

export type JobData = {
  periodStart: Date
  periodEnd: Date
}

export default async function notifyApplicants(job: Job<JobData>) {
  const periodStart = new Date(job.data.periodStart)
  const periodEnd = new Date(job.data.periodEnd)

  logger.info('Finding denied applicants', { periodStart, periodEnd })
  const deniedApplicants = await NthsApplicationRepo.needsDenialEmail(
    periodStart,
    periodEnd,
    config.sendgrid.nthsCandidateApplicationDenied
  )

  if (deniedApplicants.length) {
    await sendNTHSCandidateApplicationDenied(deniedApplicants)
    for (const deniedApplicant of deniedApplicants) {
      await createEmailNotification({
        userId: deniedApplicant.userId,
        emailTemplateId: config.sendgrid.nthsCandidateApplicationDenied,
      })
    }
  }
  logger.info('Emailed denied applicants', {
    periodStart,
    periodEnd,
    deniedApplicantsCount: deniedApplicants.length,
  })

  logger.info('Finding approved applicants', { periodStart, periodEnd })

  const approvedApplicants = await NthsApplicationRepo.needsApprovalEmail(
    periodStart,
    periodEnd,
    config.sendgrid.nthsCandidateApplicationApproved
  )

  if (approvedApplicants.length) {
    await sendNTHSCandidateApplicationApproved(approvedApplicants)
    for (const approvedApplicant of approvedApplicants) {
      await createEmailNotification({
        userId: approvedApplicant.userId,
        emailTemplateId: config.sendgrid.nthsCandidateApplicationApproved,
      })
    }
  }

  logger.info('Emailed approved applicants', {
    periodStart,
    periodEnd,
    approvedApplicantsCount: approvedApplicants.length,
  })
}
