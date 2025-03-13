import { Job } from 'bull'
import moment from 'moment'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { Uuid } from '../../../models/pgUtils'
import { getStudentContactInfoById } from '../../../models/Student/queries'
import { getVolunteerContactInfoById } from '../../../models/Volunteer/queries'
import { Jobs } from '../index'
import { getSessionById } from '../../../models/Session'

type StudentSessionActionsJobData = {
  sessionId: Uuid
}

export default async (
  job: Job<StudentSessionActionsJobData>
): Promise<void> => {
  const { data, name: currentJob } = job
  const session = await getSessionById(data.sessionId)
  const student = await getStudentContactInfoById(session.studentId)
  let volunteer
  if (session.volunteerId)
    volunteer = await getVolunteerContactInfoById(session.volunteerId)

  if (student) {
    try {
      const { firstName: studentFirstName, email } = student
      if (currentJob === Jobs.EmailStudentAbsentWarning)
        await MailService.sendStudentAbsentWarning(email, studentFirstName)
      if (currentJob === Jobs.EmailStudentAbsentVolunteerApology && volunteer)
        await MailService.sendStudentAbsentVolunteerApology(
          studentFirstName,
          email,
          volunteer?.firstName,
          session.subjectDisplayName,
          moment(session.createdAt).format('MMMM Do')
        )
      if (currentJob === Jobs.EmailStudentUnmatchedApology)
        await MailService.sendStudentUnmatchedApology(
          studentFirstName,
          email,
          session.subjectDisplayName,
          moment(session.createdAt).format('MMMM Do')
        )
      if (currentJob === Jobs.EmailStudentOnlyLookingForAnswers)
        await MailService.sendOnlyLookingForAnswersWarning(
          studentFirstName,
          email
        )

      log(`Emailed ${currentJob} to student ${session.studentId}`)
    } catch (error) {
      throw new Error(
        `Failed to email ${currentJob} to student ${session.studentId}: ${error}`
      )
    }
  }
}
