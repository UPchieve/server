import { Job } from 'bull'
import * as MailService from '../../services/MailService'
import {
  StudentContactInfo,
  getStudentContactInfoById,
} from '../../models/Student/queries'
import { safeAsync } from '../../utils/safe-async'
import { Jobs } from '.'
import {
  getVolunteerContactInfoById,
  VolunteerContactInfo,
} from '../../models/Volunteer/queries'
import { asObjectId } from '../../utils/type-utils'

interface TechIssueApology {
  sessionId: string // TODO: we don't need this?
  studentId: string
  volunteerId: string
}

async function sendEmailToUser(
  user: StudentContactInfo | VolunteerContactInfo
): Promise<void> {
  const { firstname, email } = user

  await MailService.sendTechIssueApology(email, firstname)
}

export default async (job: Job<TechIssueApology>): Promise<void> => {
  const studentId = asObjectId(job.data.studentId)
  const volunteerId = asObjectId(job.data.volunteerId)
  const student = await getStudentContactInfoById(studentId)
  const volunteer = await getVolunteerContactInfoById(volunteerId)
  const errors: string[] = []

  if (student) {
    const emailResult = await safeAsync(sendEmailToUser(student))
    if (emailResult.error)
      errors.push(`student ${student._id}: ${emailResult.error}`)
  }

  if (volunteer) {
    const emailResult = await safeAsync(sendEmailToUser(volunteer))
    if (emailResult.error)
      errors.push(`volunteer ${volunteer._id}: ${emailResult.error}`)
  }

  if (errors.length) {
    throw new Error(
      `Failed to send ${Jobs.EmailTechIssueApology} to: ${errors}`
    )
  }
}
