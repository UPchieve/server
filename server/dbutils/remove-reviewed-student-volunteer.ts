import mongoose from 'mongoose'
import SessionModel from '../models/Session'
import * as db from '../db'
import logger from '../logger'

async function upgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()
    const result = await SessionModel.updateMany(
      {},
      {
        $unset: {
          reviewedStudent: '',
          reviewedVolunteer: ''
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

async function downgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()

    await SessionModel.updateMany(
      {
        toReview: true
      },
      // These are being arbitrarily set. As long as one of these fields are true,
      // we can replicate previous behavior with what sessions need to be reviewed
      { reviewedStudent: true, reviewedVolunteer: false }
    )

    logger.info(
      'Successfully added `reviewedStudent` and `reviewedVolunteer` back to session documents'
    )
  } catch (error) {
    logger.error(error)
    exitCode = 1
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node server/dbutils/remove-reviewed-student-volunteer.ts
if (process.env.DOWNGRADE) {
  downgrade()
} else {
  upgrade()
}
