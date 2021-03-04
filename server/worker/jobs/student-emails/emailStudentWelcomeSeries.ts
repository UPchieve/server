import { Types } from 'mongoose'
import { Job } from 'bull'
import logger from '../../../logger'
import MailService from '../../../services/MailService'
import { getStudent } from '../../../services/StudentService'
import { Jobs } from '../index'

interface WelcomeEmail {
  studentId: string | Types.ObjectId
}

export default async (job: Job<WelcomeEmail>): Promise<void> => {
  const {
    data: { studentId },
    name: currentJob
  } = job
  const student = await getStudent(
    {
      _id: studentId,
      isBanned: false
    },
    {
      _id: 1,
      email: 1,
      firstname: 1
    }
  )

  if (student) {
    try {
      const { firstname: firstName, email } = student
      const mailData = { firstName, email }
      if (currentJob === Jobs.EmailStudentUseCases)
        await MailService.sendStudentUseCases(mailData)
      if (currentJob === Jobs.EmailMeetOurVolunteers)
        await MailService.sendMeetOurVolunteers(mailData)
      if (currentJob === Jobs.EmailIndependentLearning)
        await MailService.sendIndependentLearning(mailData)

      logger.info(`Emailed ${currentJob} to student ${studentId}`)
    } catch (error) {
      logger.error(
        `Failed to email ${currentJob} to student ${studentId}: ${error}`
      )
    }
  }
}
