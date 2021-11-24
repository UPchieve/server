import mongoose from 'mongoose'
import * as db from '../db'
import Notification from '../models/Notification'
import Session from '../models/Session'

// Run:
// npx ts-node server/dbutils/add-sessionid-to-notifications.ts
async function upgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()
    const sessions = await Session.find(
      {
        'notifications.0': { $exists: true },
      },
      { notifications: 1 }
    )
      .lean()
      .exec()

    let totalUpdated = 0

    for (const session of sessions) {
      const result = await Notification.updateMany(
        {
          _id: {
            $in: session.notifications,
          },
        },
        {
          $set: {
            sessionId: session._id,
          },
        }
      )
      totalUpdated += result.nModified
    }

    console.log(
      `Successfully added sessionId to ${totalUpdated} notification docs`
    )
  } catch (error) {
    console.error(error)
    exitCode = 1
  } finally {
    await mongoose.disconnect()
    process.exit(exitCode)
  }
}

async function downgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()
    const result = await Notification.updateMany(
      { sessionId: { $exists: true } },
      {
        $unset: {
          sessionId: '',
        },
      }
    )
    console.log('Updated: ', result)
  } catch (error) {
    console.error(error)
    exitCode = 1
  } finally {
    await mongoose.disconnect()
    process.exit(exitCode)
  }
}

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node server/dbutils/add-sessionid-to-notifications.ts
if (process.env.DOWNGRADE) {
  downgrade()
} else {
  upgrade()
}
