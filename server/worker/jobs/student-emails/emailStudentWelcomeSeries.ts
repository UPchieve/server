import { Types } from 'mongoose'
import { Job } from 'bull'
import logger from '../../../logger'
import * as MailService from '../../../services/MailService'
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
      if (currentJob === Jobs.EmailStudentUseCases)
        await MailService.sendStudentUseCases(email, firstName)
      if (currentJob === Jobs.EmailMeetOurVolunteers)
        await MailService.sendMeetOurVolunteers(email, firstName)
      if (currentJob === Jobs.EmailIndependentLearning)
        await MailService.sendIndependentLearning(email, firstName)
      if (currentJob === Jobs.EmailStudentGoalSetting)
        await MailService.sendStudentGoalSetting(email, firstName)

      logger.info(`Emailed ${currentJob} to student ${studentId}`)
    } catch (error) {
      throw new Error(
        `Failed to email ${currentJob} to student ${studentId}: ${error}`
      )
    }
  }
}
