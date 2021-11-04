import { Job } from 'bull'
import moment from 'moment'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { Types } from 'mongoose'
import { getStudentContactInfoById } from '../../../models/Student/queries'
import { getVolunteerContactInfoById } from '../../../models/Volunteer/queries'
import { Jobs } from '../index'
import { ISOString } from '../../../constants'
import formatMultiWordSubject from '../../../utils/format-multi-word-subject'
import {
  asFactory,
  asObjectId,
  asOptional,
  asString,
} from '../../../utils/type-utils'

interface StudentSessionActionsJobData {
  studentId: Types.ObjectId
  volunteerId?: Types.ObjectId
  sessionSubtopic: string
  sessionDate: ISOString
}

const asStudentActionsData = asFactory<StudentSessionActionsJobData>({
  studentId: asObjectId,
  volunteerId: asOptional(asObjectId),
  sessionSubtopic: asString,
  sessionDate: asString,
})

export default async (
  job: Job<StudentSessionActionsJobData>
): Promise<void> => {
  const { data, name: currentJob } = job
  const {
    studentId,
    volunteerId,
    sessionSubtopic,
    sessionDate,
  } = asStudentActionsData(data)
  const student = await getStudentContactInfoById(studentId)
  let volunteer
  if (volunteerId) volunteer = await getVolunteerContactInfoById(volunteerId)

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

      log(`Emailed ${currentJob} to student ${studentId}`)
    } catch (error) {
      throw new Error(
        `Failed to email ${currentJob} to student ${studentId}: ${error}`
      )
    }
  }
}
