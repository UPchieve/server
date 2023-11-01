import * as StudentRepo from '../models/Student'
import { RepoReadError } from '../models/Errors'
import { log } from '../worker/logger'
export const deleteDuplicateStudentFavoriteVolunteers = async (): Promise<void> => {
  const numDuplicatesBefore = await StudentRepo.countDuplicateStudentVolunteerFavorites()
  if (numDuplicatesBefore === 0) {
    log('Found 0 duplicates in student_favorite_volunteers. Returning')
    return
  }

  await StudentRepo.deleteDuplicateStudentVolunteerFavorites()
  const numDuplicatesAfter = await StudentRepo.countDuplicateStudentVolunteerFavorites()
  if (numDuplicatesAfter !== 0) {
    log(
      `${numDuplicatesAfter} duplicate(s) still remain after deleting duplicates`
    )
  }
}
