import mongoose from 'mongoose'
import * as db from '../db'

import NotificationModel from '../models/Notification'
import SessionModel from '../models/Session'

async function main() {
  let exitCode = 0
  try {
    await db.connect()

    const reportTech = await SessionModel.updateMany(
      {
        reportReason: 'LGECACY: Technical issue'
      },
      {
        reportReason: 'LEGACY: Technical issue'
      }
    )
    if (!reportTech.acknowledged) console.error('Did not add new Tech to report reasons')

    const reportUnresponsive = await SessionModel.updateMany(
      {
        reportReason: 'LGECACY: Student was unresponsive'
      },
      {
        reportReason: 'LEGACY: Student was unresponsive'
      }
    )
    if (!reportUnresponsive.acknowledged) console.error('Did not add new Unresponsive to report reasons')

    // clean notification priority groups
    const reg7 = await NotificationModel.updateMany(
      {
        priorityGroup: 'Regular volunteers - not notified in last 7 days'
      },
      {
        priorityGroup: 'LEGACY: Regular volunteers - not notified in last 7 days'
      }
    ).exec()
    if (!reg7.acknowledged) console.error('Did not update priority group: Regular volunteers - not notified in last 7 days')
    const part7 = await NotificationModel.updateMany(
      {
        priorityGroup: 'Partner volunteers - not notified in the last 7 days'
      },
      {
        priorityGroup: 'LEGACY: Partner volunteers - not notified in the last 7 days'
      }
    ).exec()
    if (!part7.acknowledged) console.error('Did not update priority group: Partner volunteers - not notified in the last 7 days')
    const part3 = await NotificationModel.updateMany(
      {
        priorityGroup: 'Partner volunteers - not notified in the last 3 days'
      },
      {
        priorityGroup: 'LEGACY: Partner volunteers - not notified in the last 3 days'
      }
    ).exec()
    if (!part3.acknowledged) console.error('Did not update priority group: Partner volunteers - not notified in the last 3 days')
    const highLevel = await NotificationModel.updateMany(
      {
        priorityGroup: 'All volunteers - not notified in the last 15 mins who don\'t have "high level subjects"'
      },
      {
        priorityGroup: 'LEGACY: All volunteers - not notified in the last 15 mins who don\'t have "high level subjects"'
      }
    ).exec()
    if (!highLevel.acknowledged) console.error('Did not update priority group: All volunteers - not notified in the last 15 mins who don\'t have "high level subjects"')
    const mizuno = await NotificationModel.updateMany(
      {
        priorityGroup: 'Mizuho and Atlassian volunteers - Not notified in last 3 days'
      },
      {
        priorityGroup: 'LEGACY: Mizuho and Atlassian volunteers - Not notified in last 3 days'
      }
    ).exec()
    if (!mizuno.acknowledged) console.error('Did not update priority group: Mizuho and Atlassian volunteers - Not notified in last 3 days')
    const follow = await NotificationModel.updateMany(
      {
        priorityGroup: 'follow-up'
      },
      {
        priorityGroup: 'LEGACY: follow-up'
      }
    ).exec()
    if (!follow.acknowledged) console.error('Did not update priority group: follow-up')
    const nullGroup = await NotificationModel.updateMany(
      {
        priorityGroup: { $exists: false }
      },
      {
        priorityGroup: 'LEGACY: null'
      }
    ).exec()
    if (!nullGroup.acknowledged) console.error('Did not update priority group: NULL')
  } catch (error) {
    console.log(`Uncaught error: ${error}`)
    exitCode = 1
  } finally {
    await mongoose.disconnect()
    process.exit(exitCode)
  }
}

main()
