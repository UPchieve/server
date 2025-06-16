import logger from '../../logger'
import { getClient, runInTransaction } from '../../db'
import {
  getUsersWhoPassedUpc101Quiz,
  getUsersWithIncompleteTrainingCourse,
  getUsersWithNoTrainingCourse,
  upsertCompleteUpchieve101TrainingCourses,
} from '../../models/User'

export default async function () {
  try {
    const client = getClient()
    const usersWhoPassedUpchieve101Quiz =
      await getUsersWhoPassedUpc101Quiz(client)
    const usersWithIncompleteUpcTrainingCourse =
      await getUsersWithIncompleteTrainingCourse(
        usersWhoPassedUpchieve101Quiz,
        client
      )
    const usersWithNoUpcTrainingCourse = await getUsersWithNoTrainingCourse(
      usersWhoPassedUpchieve101Quiz,
      client
    )

    const distinctUserIds = new Set<string>([
      ...usersWithIncompleteUpcTrainingCourse,
      ...usersWithNoUpcTrainingCourse,
    ])
    logger.info(
      {
        totalUsers: distinctUserIds.size,
        incompleteUpc101: usersWithIncompleteUpcTrainingCourse.length,
        noUpc101: usersWithNoUpcTrainingCourse.length,
      },
      `Found ${distinctUserIds.size} users to backfill UPchieve101 for`
    )

    await runInTransaction(async (tc) => {
      const upserted = await upsertCompleteUpchieve101TrainingCourses(
        Array.from(distinctUserIds),
        tc
      )
      if (upserted.length !== distinctUserIds.size) {
        throw new Error(
          `Failed to upsert complete UPC101 for all ${distinctUserIds.size} users; only could do ${upserted.length}. Rolling back.`
        )
      }
      logger.info(
        `Upserted complete UPchieve 101 training courses for ${upserted.length} users`
      )
    }, client)
  } catch (err) {
    logger.error(
      `Failed to backfill complete training coureses for users: ${err}`
    )
  }
}
