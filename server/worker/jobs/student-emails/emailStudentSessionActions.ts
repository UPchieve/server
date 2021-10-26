import { Job } from 'bull'
import moment from 'moment'
import logger from '../../../logger'
import * as MailService from '../../../services/MailService'
import { getStudentContactInfoById } from '../../../models/Student/queries'
import { getVolunteerContactInfoById } from '../../../models/Volunteer/queries'
import { Jobs } from '../index'
import { ISOString } from '../../../constants'
import formatMultiWordSubject from '../../../utils/format-multi-word-subject'

interface StudentSessionActionsJobData {
  studentId: string
  volunteerId: string
  sessionSubtopic: string
  sessionDate: ISOString
}

export default async (
  job: Job<StudentSessionActionsJobData>
): Promise<void> => {
  const {
    data: { studentId, volunteerId, sessionSubtopic, sessionDate },
    name: currentJob
  } = job
  const student = await getStudentContactInfoById(studentId)
  let volunteer
  if (volunteerId)
    volunteer = await getVolunteerContactInfoById(volunteerId)

  if (student) {
    try {
      const { firstname: studentFirstName, email } = student
      if (currentJob === Jobs.EmailStudentAbsentWarning)
        await MailService.sendStudentAbsentWarning(email, studentFirstName)
      if (currentJob === Jobs.EmailStudentAbsentVolunteerApology && volunteer)
        await MailService.sendStudentAbsentVolunteerApology(
          studentFirstName,
          email,
          volunteer?.firstname,
          formatMultiWordSubject(sessionSubtopic),
          moment(sessionDate).format('MMMM Do')
        )
      if (currentJob === Jobs.EmailStudentUnmatchedApology)
        await MailService.sendStudentUnmatchedApology(
          studentFirstName,
          email,
          formatMultiWordSubject(sessionSubtopic),
          moment(sessionDate).format('MMMM Do')
        )

      logger.info(`Emailed ${currentJob} to student ${studentId}`)
    } catch (error) {
      throw new Error(
        `Failed to email ${currentJob} to student ${studentId}: ${error}`
      )
    }
  }
}
