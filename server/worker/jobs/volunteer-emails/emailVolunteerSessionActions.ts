import { Job } from 'bull'
import moment from 'moment'
import logger from '../../../logger'
import MailService from '../../../services/MailService'
import { Jobs } from '../index'
import { EMAIL_RECIPIENT } from '../../../utils/aggregation-snippets'
import { getUser } from '../../../services/UserService'
import { getStudent } from '../../../services/StudentService'
import { ISOString } from '../../../constants'
import formatMultiWordSubject from '../../../utils/format-multi-word-subject'

interface VolunteerSessionTriggers {
  volunteerId: string
  studentId: string
  sessionSubtopic: string
  sessionDate: ISOString
}

export default async (job: Job<VolunteerSessionTriggers>): Promise<void> => {
  const {
    data: { volunteerId, studentId, sessionSubtopic, sessionDate },
    name: currentJob
  } = job

  const volunteer = await getUser(
    {
      _id: volunteerId,
      ...EMAIL_RECIPIENT
    },
    {
      _id: 1,
      email: 1,
      firstname: 1
    }
  )
  const student = await getStudent(
    {
      _id: studentId,
      ...EMAIL_RECIPIENT
    },
    {
      firstname: 1
    }
  )

  if (volunteer) {
    try {
      const { firstname: firstName, email } = volunteer
      const mailData = {
        firstName,
        email,
        studentFirstName: student.firstname,
        sessionSubject: formatMultiWordSubject(sessionSubtopic),
        sessionDate: moment(sessionDate).format('MMMM Do')
      }
      if (currentJob === Jobs.EmailVolunteerAbsentWarning)
        await MailService.sendVolunteerAbsentWarning(mailData)
      if (currentJob === Jobs.EmailVolunteerAbsentStudentApology)
        await MailService.sendVolunteerAbsentStudentApology(mailData)

      logger.info(`Emailed ${currentJob} to volunteer ${volunteerId}`)
    } catch (error) {
      throw new Error(
        `Failed to email ${currentJob} to volunteer ${volunteerId}: ${error}`
      )
    }
  }
}
