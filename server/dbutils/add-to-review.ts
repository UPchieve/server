import mongoose from 'mongoose'
import SessionModel from '../models/Session'
import * as db from '../db'
import moment from 'moment'
import logger from '../logger'

async function upgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()
    const thirtyDaysAgo = moment()
      .utc()
      .subtract(30, 'days')
      .toDate()

    // Set `toReview` to `true` for sessions created in the past 30 days that
    // have not been reviewed
    await SessionModel.updateMany(
      {
        $or: [{ reviewedVolunteer: false }, { reviewedStudent: false }],
        createdAt: {
          $gte: thirtyDaysAgo
        }
      },
      { toReview: true }
    )

    // Session documents without `toReview` set from the above write operation,
    // will have `toReview` set to `false`
    await SessionModel.updateMany(
      {
        toReview: { $exists: false }
      },
      { toReview: false }
    )

    logger.info('Successfully added `toReview` to all session documents')
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
          toReview: ''
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
// DOWNGRADE=true npx ts-node server/dbutils/add-to-review.ts
if (process.env.DOWNGRADE) {
  downgrade()
} else {
  upgrade()
}
