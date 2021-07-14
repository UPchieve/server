import mongoose from 'mongoose'
import * as db from '../db'
import generateAndStoreWaitTimeHeatMap from '../worker/jobs/generateAndStoreWaitTimeHeatMap'
import logger from '../logger'

const main = async (): Promise<void> => {
  try {
    await db.connect()
    await generateAndStoreWaitTimeHeatMap()
  } catch (error) {
    logger.error(error)
    process.exit(1)
  } finally {
    mongoose.disconnect()
    process.exit(0)
  }
}

// To run the migration run:
// npx ts-node server/dbutils/init-wait-time-heat-map.ts
main()
