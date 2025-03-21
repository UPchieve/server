import { Job } from 'bull'
import moment from 'moment'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { Uuid } from '../../../models/pgUtils'
import { getStudentContactInfoById } from '../../../models/Student/queries'
import {
  getVolunteerContactInfoById,
  VolunteerContactInfo,
} from '../../../models/Volunteer/queries'
import { Jobs } from '../index'
import { getSessionById, Session } from '../../../models/Session'
import {
  createEmailNotification,
  hasUserBeenSentEmail,
} from '../../../services/NotificationService'
import config from '../../../config'
import { StudentContactInfo } from '../../../models/Student'

type StudentSessionActionsJobData = {
  sessionId: Uuid
}

function getSendGridTemplate(currentJob: Jobs): string | undefined {
  const sendGridTemplates: Partial<Record<Jobs, string>> = {
    [Jobs.EmailStudentAbsentWarning]:
      config.sendgrid.studentAbsentWarningTemplate,
    [Jobs.EmailStudentAbsentVolunteerApology]:
      config.sendgrid.studentAbsentVolunteerApologyTemplate,
    [Jobs.EmailStudentUnmatchedApology]:
      config.sendgrid.studentUnmatchedApologyTemplate,
    [Jobs.EmailStudentOnlyLookingForAnswers]:
      config.sendgrid.studentOnlyLookingForAnswersTemplate,
  }

  return sendGridTemplates[currentJob]
}

function getEmailForJob(
  jobName: Jobs,
  session: Session,
  student: StudentContactInfo,
  volunteer?: VolunteerContactInfo
): (() => Promise<void>) | undefined {
  const emailMapForJob: Partial<Record<Jobs, () => Promise<void>>> = {
    [Jobs.EmailStudentAbsentWarning]: () =>
      MailService.sendStudentAbsentWarning(student.email, student.firstName),

    [Jobs.EmailStudentAbsentVolunteerApology]: async () =>
      volunteer
        ? MailService.sendStudentAbsentVolunteerApology(
            student.firstName,
            student.email,
            volunteer.firstName,
            session.subjectDisplayName,
            moment(session.createdAt).format('MMMM Do')
          )
        : undefined,

    [Jobs.EmailStudentUnmatchedApology]: () =>
      MailService.sendStudentUnmatchedApology(
        student.firstName,
        student.email,
        session.subjectDisplayName,
        moment(session.createdAt).format('MMMM Do')
      ),

    [Jobs.EmailStudentOnlyLookingForAnswers]: () =>
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
  if (!student) return log(`No student found with id ${session.studentId}`)

  const emailTemplateId = getSendGridTemplate(currentJob as Jobs)
  if (!emailTemplateId)
    return log(`No email template id found for ${currentJob}`)

  const hasReceivedEmailForJob = await hasUserBeenSentEmail({
    userId: student.id,
    emailTemplateId,
  })
  if (hasReceivedEmailForJob)
    return log(
      `Student ${student.id} has already received ${currentJob} for session ${session.id}`
    )

  const volunteer = session.volunteerId
    ? await getVolunteerContactInfoById(session.volunteerId)
    : undefined
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
      userId: student.id,
      sessionId: session.id,
      emailTemplateId,
    })

    log(`Emailed ${currentJob} to student ${session.studentId}`)
  } catch (error) {
    throw new Error(
      `Failed to email ${currentJob} to student ${session.studentId}: ${error}`
    )
  }
}
