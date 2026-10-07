import { Job } from 'bull'
import moment from 'moment'
import logger from '../../../logger'
import * as MailService from '../../../services/MailService'
import { Uuid } from '../../../models/pgUtils'
import { getStudentContactInfoById } from '../../../models/Student/queries'
import {
  getVolunteerContactInfoById,
  VolunteerContactInfo,
} from '../../../models/Volunteer/queries'
import type { JobName } from '../index'
import { getSessionById, GetSessionByIdResult } from '../../../models/Session'
import {
  createEmailNotification,
  hasUserBeenSentEmail,
} from '../../../services/NotificationService'
import config from '../../../config'
import { StudentContactInfo } from '../../../models/Student'

type StudentSessionActionsJobData = {
  sessionId: Uuid
}

function getSendGridTemplate(currentJob: JobName): string | undefined {
  const sendGridTemplates: Partial<Record<JobName, string>> = {
    EmailStudentAbsentWarning: config.sendgrid.studentAbsentWarningTemplate,
    EmailStudentAbsentVolunteerApology:
      config.sendgrid.studentAbsentVolunteerApologyTemplate,
    EmailStudentUnmatchedApology:
      config.sendgrid.studentUnmatchedApologyTemplate,
    EmailStudentOnlyLookingForAnswers:
      config.sendgrid.studentOnlyLookingForAnswersTemplate,
  }

  return sendGridTemplates[currentJob]
}

function getEmailForJob(
  jobName: JobName,
  session: GetSessionByIdResult,
  student: StudentContactInfo,
  volunteer?: VolunteerContactInfo
): (() => Promise<void>) | undefined {
  const emailMapForJob: Partial<Record<JobName, () => Promise<void>>> = {
    EmailStudentAbsentWarning: () =>
      MailService.sendStudentAbsentWarning(student.email, student.firstName),

    EmailStudentAbsentVolunteerApology: async () =>
      volunteer
        ? MailService.sendStudentAbsentVolunteerApology(
            student.firstName,
            student.email,
            volunteer.firstName,
            session.subjectDisplayName,
            moment(session.createdAt).format('MMMM Do')
          )
        : undefined,

    EmailStudentUnmatchedApology: () =>
      MailService.sendStudentUnmatchedApology(
        student.firstName,
        student.email,
        session.subjectDisplayName,
        moment(session.createdAt).format('MMMM Do')
      ),

    EmailStudentOnlyLookingForAnswers: () =>
      MailService.sendOnlyLookingForAnswersWarning(
        student.firstName,
        student.email
      ),
  }
  return emailMapForJob[jobName]
}

export default async (
  job: Job<StudentSessionActionsJobData>
): Promise<void> => {
  const { data, name: currentJob } = job
  const session = await getSessionById(data.sessionId)
  const student = await getStudentContactInfoById(session.studentId)
  if (!student)
    return logger.info(`No student found with id ${session.studentId}`)

  const emailTemplateId = getSendGridTemplate(currentJob as JobName)
  if (!emailTemplateId)
    return logger.warn(`No email template id found for ${currentJob}`)

  const hasReceivedEmailForJob = await hasUserBeenSentEmail({
    userId: student.id,
    emailTemplateId,
  })
  if (hasReceivedEmailForJob)
    return logger.info(
      `Student ${student.id} has already received ${currentJob} for session ${session.id}`
    )

  const volunteer = session.volunteerId
    ? await getVolunteerContactInfoById(session.volunteerId)
    : undefined
  try {
    const emailForJob = getEmailForJob(
      currentJob as JobName,
      session,
      student,
      volunteer
    )
    if (!emailForJob) return
    await emailForJob()
    await createEmailNotification({
      userId: student.id,
      sessionId: session.id,
      emailTemplateId,
    })

    logger.info(`Emailed ${currentJob} to student ${session.studentId}`)
  } catch (error) {
    throw new Error(
      `Failed to email ${currentJob} to student ${session.studentId}: ${error}`
    )
  }
}
