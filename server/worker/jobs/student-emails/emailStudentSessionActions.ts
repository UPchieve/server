import { Job } from 'bull'
import moment from 'moment'
import logger from '../../../logger'
import MailService from '../../../services/MailService'
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
      const { firstname: firstName, email } = student
      const mailData = {
        firstName,
        email,
        volunteerFirstName: volunteer?.firstname,
        sessionSubject: formatMultiWordSubject(sessionSubtopic),
        sessionDate: moment(sessionDate).format('MMMM Do')
      }
      if (currentJob === Jobs.EmailStudentAbsentWarning)
        await MailService.sendStudentAbsentWarning(mailData)
      if (currentJob === Jobs.EmailStudentAbsentVolunteerApology && volunteer)
        await MailService.sendStudentAbsentVolunteerApology(mailData)
      if (currentJob === Jobs.EmailStudentUnmatchedApology)
        await MailService.sendStudentUnmatchedApology(mailData)

      logger.info(`Emailed ${currentJob} to student ${studentId}`)
    } catch (error) {
      throw new Error(
        `Failed to email ${currentJob} to student ${studentId}: ${error}`
      )
    }
  }
}
