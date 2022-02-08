import mongoose from 'mongoose'
import VolunteerModel from '../models/Volunteer'
import * as db from '../db'
import logger from '../logger'

async function main(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()
    const result = await VolunteerModel.updateMany(
      { 'references.status': { $eq: null, $exists: true } },
      {
        $pull: {
          references: {
            status: { $eq: null }
          }
        }
      }
    )
    logger.info(result)
  } catch (error) {
    logger.error(error as Error)
    exitCode = 1
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}

main()
