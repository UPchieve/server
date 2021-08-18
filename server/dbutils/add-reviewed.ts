import mongoose from 'mongoose'
import SessionModel from '../models/Session'
import * as db from '../db'
import logger from '../logger'

async function upgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()
    // Set `reviewed` to `false` for all sessions
    await SessionModel.updateMany({}, { reviewed: false })

    // Set reviewed to `true` for sessions that both the student and volunteer were reviewed
    await SessionModel.updateMany(
      {
        reviewedVolunteer: true,
        reviewedStudent: true
      },
      { reviewed: true }
    )
    logger.info('Successfully added `reviewed` to all session documents')
  } catch (error) {
    logger.error(error)
    exitCode = 1
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}

async function downgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()
    const result = await SessionModel.updateMany(
      {},
      {
        $unset: {
          reviewed: ''
        }
      }
    )
    logger.info(result)
  } catch (error) {
    logger.error(error)
    exitCode = 1
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node server/dbutils/add-reviewed.ts
if (process.env.DOWNGRADE) {
  downgrade()
} else {
  upgrade()
}
