import * as StudentRepo from '../models/Student'
import { log } from '../worker/logger'
import { runInTransaction, TransactionClient } from '../db'
export const deleteDuplicateStudentFavoriteVolunteers = async (): Promise<void> => {
  const numDuplicates = await StudentRepo.countDuplicateStudentVolunteerFavorites()
  if (numDuplicates === 0) {
    log('Found 0 duplicates in student_favorite_volunteers. Returning')
    return
  }
  log(`Found ${numDuplicates} duplicates in student_favorite_volunteers`)

  await runInTransaction(async (tc: TransactionClient) => {
    const numDeleted = await StudentRepo.deleteDuplicateStudentVolunteerFavorites(
      tc
    )

    if (numDeleted !== numDuplicates) {
      throw new Error(
        `Expected to delete ${numDuplicates} duplicates from student_favorite_volunteers, but actually deleted ${numDeleted}. Will rollback.`
      )
    }

    log(`Deleted ${numDeleted} duplicates from student_favorite_volunteers`)
  })
}

export default deleteDuplicateStudentFavoriteVolunteers
