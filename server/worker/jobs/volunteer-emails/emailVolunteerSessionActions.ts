import { Job } from 'bull'
import moment from 'moment'
import logger from '../../../logger'
import * as MailService from '../../../services/MailService'
import { Jobs } from '../index'
import { getVolunteerContactInfoById } from '../../../models/Volunteer/queries'
import { getStudentContactInfoById } from '../../../models/Student/queries'
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

  const volunteer = await getVolunteerContactInfoById(volunteerId)
  const student = await getStudentContactInfoById(studentId)

  if (student && volunteer) {
    try {
      const { firstname, email } = volunteer
      if (currentJob === Jobs.EmailVolunteerAbsentWarning)
        await MailService.sendVolunteerAbsentWarning(
          firstname,
          email,
          student.firstname,
          formatMultiWordSubject(sessionSubtopic),
          moment(sessionDate).format('MMMM Do')
        )
      if (currentJob === Jobs.EmailVolunteerAbsentStudentApology)
        await MailService.sendVolunteerAbsentStudentApology(
          firstname,
          email,
          student.firstname,
          formatMultiWordSubject(sessionSubtopic),
          moment(sessionDate).format('MMMM Do')
        )

      logger.info(`Emailed ${currentJob} to volunteer ${volunteerId}`)
    } catch (error) {
      throw new Error(
        `Failed to email ${currentJob} to volunteer ${volunteerId}: ${error}`
      )
    }
  }
}
