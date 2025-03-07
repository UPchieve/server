import * as MailService from './MailService'
import * as UserService from './UserService'

export async function emailFavoritedVolunteer(
  volunteerId: string,
  studentId: string
) {
  const volunteer = await UserService.getUserContactInfo(volunteerId)
  const student = await UserService.getUserContactInfo(studentId)

  if (!volunteer || !student) {
    return
  }
  await MailService.sendStudentFavoritedVolunteerEmail(
    volunteer.email,
    volunteer.firstName,
    student.firstName
  )
}
