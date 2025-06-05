import { Job } from 'bull'
import moment from 'moment'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { Jobs } from '../index'
import {
  getVolunteerContactInfoById,
  VolunteerContactInfo,
} from '../../../models/Volunteer/queries'
import { getStudentContactInfoById } from '../../../models/Student/queries'
import { Uuid } from '../../../models/pgUtils'
import { getSessionById, GetSessionByIdResult } from '../../../models/Session'
import {
  createEmailNotification,
  hasUserBeenSentEmail,
} from '../../../services/NotificationService'
import config from '../../../config'
import { StudentContactInfo } from '../../../models/Student'

type VolunteerSessionActionsJobData = {
  sessionId: Uuid
}

function getSendGridTemplate(currentJob: Jobs): string | undefined {
  const sendGridTemplates: Partial<Record<Jobs, string>> = {
    [Jobs.EmailVolunteerAbsentWarning]:
      config.sendgrid.volunteerAbsentWarningTemplate,
    [Jobs.EmailVolunteerAbsentStudentApology]:
      config.sendgrid.volunteerAbsentStudentApologyTemplate,
  }
  return sendGridTemplates[currentJob]
}

function getEmailForJob(
  jobName: Jobs,
  session: GetSessionByIdResult,
  student: StudentContactInfo,
  volunteer: VolunteerContactInfo
): (() => Promise<void>) | undefined {
  const emailMapForJob: Partial<Record<Jobs, () => Promise<void>>> = {
    [Jobs.EmailVolunteerAbsentWarning]: () =>
      MailService.sendVolunteerAbsentWarning(
        volunteer.firstName,
        volunteer.email,
        student.firstName,
        session.subjectDisplayName,
        moment(session.createdAt).format('MMMM Do')
      ),

    [Jobs.EmailVolunteerAbsentStudentApology]: () =>
      MailService.sendVolunteerAbsentStudentApology(
        volunteer.firstName,
        volunteer.email,
        student.firstName,
        session.subjectDisplayName,
        moment(session.createdAt).format('MMMM Do')
      ),
  }
  return emailMapForJob[jobName]
}

export default async (
  job: Job<VolunteerSessionActionsJobData>
): Promise<void> => {
  const { data, name: currentJob } = job
  const session = await getSessionById(data.sessionId)
  if (!session.volunteerId)
    return log(`No volunteer found on session ${session.id}`)

  const volunteer = await getVolunteerContactInfoById(session.volunteerId, {
    deactivated: false,
    testUser: false,
    banned: false,
  })
  if (!volunteer)
    return log(`No volunteer found with id ${session.volunteerId}`)

  const emailTemplateId = getSendGridTemplate(currentJob as Jobs)
  if (!emailTemplateId)
    return log(`No email template id found for ${currentJob}`)

  const hasReceivedEmailForJob = await hasUserBeenSentEmail({
    userId: volunteer.id,
    emailTemplateId,
  })
  if (hasReceivedEmailForJob)
    return log(
      `Volunteer ${volunteer.id} has already received ${currentJob} for session ${session.id}`
    )

  const student = await getStudentContactInfoById(session.studentId)
  if (!student) return log(`No student found with id ${session.studentId}`)

  try {
    const emailForJob = getEmailForJob(
      currentJob as Jobs,
      session,
      student,
      volunteer
    )
    if (!emailForJob) return
    await emailForJob()
    await createEmailNotification({
      userId: volunteer.id,
      sessionId: session.id,
      emailTemplateId,
    })

    log(`Emailed ${currentJob} to volunteer ${volunteer.id}`)
  } catch (error) {
    throw new Error(
      `Failed to email ${currentJob} to volunteer ${volunteer.id}: ${error}`
    )
  }
}
