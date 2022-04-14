import mongoose from 'mongoose'
import * as db from '../db'

import NotificationModel from '../models/Notification'
import SessionModel from '../models/Session'

async function main() {
  let exitCode = 0
  try {
    await db.connect()

    // clean notification priority groups
    const reg3 = await NotificationModel.updateMany(
      {
        priorityGroup: 'Regular volunteers - not notified in the last 3 days AND they don’t have "high level subjects"'
      },
      {
        priorityGroup: 'Regular volunteers - not notified in the last 3 days AND they don\'t have "high level subjects"'
      }
    ).exec()
    if (!reg3.acknowledged) console.error('Did not update priority group: Regular volunteers - not notified in the last 3 days AND they don\'t have "high level subjects"')
    const reg24 = await NotificationModel.updateMany(
      {
        priorityGroup: 'Regular volunteers - not notified in the last 24 hours AND they don’t have "high level subjects"'
      },
      {
        priorityGroup: 'Regular volunteers - not notified in the last 24 hours AND they don\'t have "high level subjects"'
      }
    ).exec()
    if (!reg24.acknowledged) console.error('Did not update priority group: Regular volunteers - not notified in the last 24 hours AND they don\'t have "high level subjects"')
    const part3 = await NotificationModel.updateMany(
      {
        priorityGroup: 'Partner volunteers - not notified in the last 3 days AND they don’t have "high level subjects"'
      },
      {
        priorityGroup: 'Partner volunteers - not notified in the last 3 days AND they don\'t have "high level subjects"'
      }
    ).exec()
    if (!part3.acknowledged) console.error('Did not update priority group: Partner volunteers - not notified in the last 3 days AND they don\'t have "high level subjects"')
    const part24 = await NotificationModel.updateMany(
      {
        priorityGroup: 'Partner volunteers - not notified in the last 24 hours AND they don’t have "high level subjects"'
      },
      {
        priorityGroup: 'Partner volunteers - not notified in the last 24 hours AND they don\'t have "high level subjects"'
      }
    ).exec()
    if (!part24.acknowledged) console.error('Did not update priority group: Partner volunteers - not notified in the last 24 hours AND they don\'t have "high level subjects"')
    const ver3 = await NotificationModel.updateMany(
      {
        priorityGroup: 'Verizon volunteers - not notified in the last 3 days AND they don’t have "high level subjects"'
      },
      {
        priorityGroup: 'Verizon volunteers - not notified in the last 3 days AND they don\'t have "high level subjects"'
      }
    ).exec()
    if (!ver3.acknowledged) console.error('Did not update priority group: Verizon volunteers - not notified in the last 3 days AND they don\'t have "high level subjects"')
    const ver24 = await NotificationModel.updateMany(
      {
        priorityGroup: 'Verizon volunteers - not notified in the last 24 hours AND they don’t have "high level subjects"'
      },
      {
        priorityGroup: 'Verizon volunteers - not notified in the last 24 hours AND they don\'t have "high level subjects"'
      }
    ).exec()
    if (!ver24.acknowledged) console.error('Did not update priority group: Verizon volunteers - not notified in the last 24 hours AND they don\'t have "high level subjects"')
  } catch (error) {
    console.log(`Uncaught error: ${error}`)
    exitCode = 1
  } finally {
    await mongoose.disconnect()
    process.exit(exitCode)
  }
}

main()
