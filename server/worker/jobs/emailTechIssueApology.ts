import { Job } from 'bull'
import MailService from '../../services/MailService'
import { StudentContactInfo, getStudentContactInfoById } from '../../models/Student/queries'
import { safeAsync } from '../../utils/safe-async'
import { Jobs } from '.'
import { getVolunteerContactInfoById, VolunteerContactInfo } from '../../models/Volunteer/queries'

interface TechIssueApology {
  sessionId: string
  studentId: string
  volunteerId: string
}

async function sendEmailToUser(user: StudentContactInfo | VolunteerContactInfo): Promise<void> {
  const { firstname: firstName, email } = user
  const mailData = {
    firstName,
    email
  }

  await MailService.sendTechIssueApology(mailData)
}

export default async (job: Job<TechIssueApology>): Promise<void> => {
  const {
    data: { studentId, volunteerId }
  } = job
  const student = await getStudentContactInfoById(studentId)
  const volunteer = await getVolunteerContactInfoById(volunteerId)
  const errors = []

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
