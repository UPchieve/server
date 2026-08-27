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

export async function notifyApplicants(job: Job<JobData>) {
  const periodStart = new Date(job.data.periodStart)
  const periodEnd = new Date(job.data.periodEnd)

  logger.info({ periodStart, periodEnd }, 'Finding denied applicants')
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
  logger.info(
    { periodStart, periodEnd, deniedApplicantsCount: deniedApplicants.length },
    'Emailed denied applicants'
  )

  logger.info({ periodStart, periodEnd }, 'Finding approved applicants')

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

  logger.info(
    {
      periodStart,
      periodEnd,
      approvedApplicantsCount: approvedApplicants.length,
    },
    'Emailed approved applicants'
  )
}
