import mongoose from 'mongoose'
import StudentModel from '../models/Student'
import logger from '../logger'
import * as db from '../db'

async function upgrade(): Promise<void> {
  let exitCode = 0

  try {
    await db.connect()
    const result = await StudentModel.updateMany({}, { inGatesStudy: false })

    logger.info(
      `Successfully set 'inGatesStudy' to false for ${result.nModified} students`
    )
  } catch (error) {
    logger.error(error as Error)
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
    const result = await StudentModel.updateMany(
      {},
      {
        $unset: {
          inGatesStudy: '',
        },
      }
    )

    logger.info(`Removed 'inGatesStudy' for ${result.nModified} students`)
  } catch (error) {
    logger.error(error as Error)
    exitCode = 1
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node server/dbutils/add-in-gates-study.ts
if (process.env.DOWNGRADE) {
  downgrade()
} else {
  upgrade()
}
