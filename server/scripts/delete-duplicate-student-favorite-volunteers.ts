import * as StudentRepo from '../models/Student'
import { RepoReadError } from '../models/Errors'
import { log } from '../worker/logger'
import { runInTransaction, TransactionClient } from '../db'
export const deleteDuplicateStudentFavoriteVolunteers = async (): Promise<void> => {
  const numDuplicates = await StudentRepo.countDuplicateStudentVolunteerFavorites()
  if (numDuplicates === 0) {
    log('Found 0 duplicates in student_favorite_volunteers. Returning')
    return
  }

  await runInTransaction(async (tc: TransactionClient) => {
    const numDeleted = await StudentRepo.deleteDuplicateStudentVolunteerFavorites(
      tc
    )
    log(`Deleted ${numDeleted} duplicates from student_favorite_volunteers`)
    if (numDeleted !== numDuplicates) {
      log(
        `Expected to delete ${numDuplicates} duplicates from student_favorite_volunteers, but actually deleted ${numDeleted}`
      )
    }
  })
}
