import { getUserContactInfoById } from '../models/User'
import * as MailService from './MailService'

export async function emailFavoritedVolunteer(
  volunteerId: string,
  studentId: string
) {
  const volunteer = await getUserContactInfoById(volunteerId)
  const student = await getUserContactInfoById(studentId)

  if (!volunteer || !student) {
    return
  }
  await MailService.sendStudentFavoritedVolunteerEmail(
    volunteer.email,
    volunteer.firstName,
    student.firstName
  )
}
