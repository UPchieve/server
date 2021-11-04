import { Job } from 'bull'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { getStudentContactInfoById } from '../../../models/Student/queries'
import { Jobs } from '../index'
import { asObjectId } from '../../../utils/type-utils'

interface WelcomeEmail {
  studentId: string
}

export default async (job: Job<WelcomeEmail>): Promise<void> => {
  const {
    data: { studentId },
    name: currentJob,
  } = job
  const student = await getStudentContactInfoById(asObjectId(studentId))

  if (student) {
    try {
      const { firstname, email } = student
      if (currentJob === Jobs.EmailStudentUseCases)
        await MailService.sendStudentUseCases(email, firstname)
      if (currentJob === Jobs.EmailMeetOurVolunteers)
        await MailService.sendMeetOurVolunteers(email, firstname)
      if (currentJob === Jobs.EmailIndependentLearning)
        await MailService.sendIndependentLearning(email, firstname)
      if (currentJob === Jobs.EmailStudentGoalSetting)
        await MailService.sendStudentGoalSetting(email, firstname)

      log(`Emailed ${currentJob} to student ${studentId}`)
    } catch (error) {
      throw new Error(
        `Failed to email ${currentJob} to student ${studentId}: ${error}`
      )
    }
  }
}
