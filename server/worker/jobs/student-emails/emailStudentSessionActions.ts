import { Job } from 'bull'
import moment from 'moment'
import { log } from '../../logger'
import * as MailService from '../../../services/MailService'
import { Ulid } from '../../../models/pgUtils'
import { getStudentContactInfoById } from '../../../models/Student/queries'
import { getVolunteerContactInfoById } from '../../../models/Volunteer/queries'
import { Jobs } from '../index'
import { ISOString } from '../../../constants'
import formatMultiWordSubject from '../../../utils/format-multi-word-subject'
import { asFactory, asOptional, asString } from '../../../utils/type-utils'

interface StudentSessionActionsJobData {
  studentId: Ulid
  volunteerId?: Ulid
  sessionSubtopic: string
  sessionDate: ISOString
}

const asStudentActionsData = asFactory<StudentSessionActionsJobData>({
  studentId: asString,
  volunteerId: asOptional(asString),
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
      if (currentJob === Jobs.EmailStudentAbsentWarning)
        await MailService.sendStudentAbsentWarning(student)
      if (currentJob === Jobs.EmailStudentAbsentVolunteerApology && volunteer)
        await MailService.sendStudentAbsentVolunteerApology(
          student,
          volunteer?.firstName,
          formatMultiWordSubject(sessionSubtopic),
          moment(sessionDate).format('MMMM Do')
        )
      if (currentJob === Jobs.EmailStudentUnmatchedApology)
        await MailService.sendStudentUnmatchedApology(
          student,
          formatMultiWordSubject(sessionSubtopic),
          moment(sessionDate).format('MMMM Do')
        )
      if (currentJob === Jobs.EmailStudentOnlyLookingForAnswers)
        await MailService.sendOnlyLookingForAnswersWarning(
          student
        )

      log(`Emailed ${currentJob} to student ${studentId}`)
    } catch (error) {
      throw new Error(
        `Failed to email ${currentJob} to student ${studentId}: ${error}`
      )
    }
  }
}
