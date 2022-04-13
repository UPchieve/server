import mongoose from 'mongoose'
import * as db from '../db'

import NotificationModel from '../models/Notification'

async function main() {
  let exitCode = 0
  try {
    await db.connect()

    // clean notification priority groups
    const leg = await NotificationModel.updateMany(
      {
        priorityGroup: 'LEGACY: follow-up'
      },
      {
        priorityGroup: 'follow-up'
      }
    ).exec()
    if (!leg.acknowledged) console.error('Did not update priority group: LEGACY: follow-up')

    const reg7 = await NotificationModel.updateMany(
      {
        priorityGroup: 'Regular volunteers - not notified in the last 7 days'
      },
      {
        priorityGroup: 'LEGACY: Regular volunteers - not notified in the last 7 days'
      }
    ).exec()
    if (!reg7.acknowledged) console.error('Did not update priority group: Regular volunteers - not notified in the last 7 days')

  } catch (error) {
    console.log(`Uncaught error: ${error}`)
    exitCode = 1
  } finally {
    await mongoose.disconnect()
    process.exit(exitCode)
  }
}

main()
