import { Ulid } from '../models/pgUtils'
import * as MailService from './MailService'
import * as UserService from './UserService'
import * as StudentRepo from '../models/Student'

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

export async function getFavoritedVolunteerIdsFromList(
  studentId: Ulid,
  volunteers: { userId: Ulid }[]
): Promise<Set<Ulid>> {
  const favoritedIds = await StudentRepo.getFavoritedVolunteerIdsFromList(
    studentId,
    volunteers.map((v) => v.userId)
  )
  return new Set(favoritedIds)
}
