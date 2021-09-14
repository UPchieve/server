import { Job } from 'bull'
import MailService from '../../services/MailService'
import { EMAIL_RECIPIENT } from '../../utils/aggregation-snippets'
import { getUser } from '../../services/UserService'
import { getStudent } from '../../services/StudentService'
import { safeAsync } from '../../utils/safe-async'
import { Jobs } from '.'

interface TechIssueApology {
  sessionId: string
  studentId: string
  volunteerId: string
}

async function sendEmailToUser(user) {
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
  const student = await getStudent(
    { _id: studentId, ...EMAIL_RECIPIENT },
    { firstname: 1, email: 1 }
  )
  const volunteer = await getUser(
    { _id: volunteerId, ...EMAIL_RECIPIENT },
    { firstname: 1, email: 1 }
  )
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
