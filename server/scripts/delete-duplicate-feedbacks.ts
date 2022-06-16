import * as db from '../db'
import { removeDuplicateFeedbacks } from '../models/Feedback/queries';

export default async function DeleteDuplicateFeedbacks() {
  let exitCode = 0
  try {
    await db.connect()
    await removeDuplicateFeedbacks();
  } catch (error) {
    console.log(`Uncaught error: ${error}`)
    exitCode = 1
  } finally {
    await db.closeClient()
    process.exit(exitCode)
  }
}

