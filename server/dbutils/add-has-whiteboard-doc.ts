import mongoose from 'mongoose'
import * as db from '../db'
import SessionModel from '../models/Session'
import { SUBJECT_TYPES } from '../constants'
import util from 'util'
import moment from 'moment-timezone'
const setImmediatePromise = util.promisify(setImmediate)

const upgrade = async (): Promise<void> => {
  try {
    await db.connect()

    const oldestDate = new Date('2017-01-01T00:00:00.000+00:00')
    let monthsAgo = 0
    let toDate = moment()
      .utc()
      .endOf('month')

    // batch the update operations by month intervals
    while (toDate >= oldestDate) {
      const fromDate = moment()
        .utc()
        .subtract(monthsAgo, 'months')
        .startOf('month')
      toDate = moment()
        .utc()
        .subtract(monthsAgo, 'months')
        .endOf('month')
      monthsAgo++
      console.log(new Date(fromDate), new Date(toDate))

      await setImmediatePromise()
      const results = await SessionModel.updateMany(
        {
          type: { $ne: SUBJECT_TYPES.COLLEGE },
          createdAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }
        },
        { hasWhiteboardDoc: false }
      )
      console.log(results)
    }
  } catch (error) {
    console.error(error)
  }

  mongoose.disconnect()
}

async function downgrade(): Promise<void> {
  try {
    await db.connect()

    const oldestDate = new Date('2017-01-01T00:00:00.000+00:00').getTime()
    let monthsAgo = 0
    let toDate = moment()
      .utc()
      .endOf('month')

    while (toDate >= oldestDate) {
      const fromDate = moment()
        .utc()
        .subtract(monthsAgo, 'months')
        .startOf('month')
      toDate = moment()
        .utc()
        .subtract(monthsAgo, 'months')
        .endOf('month')
      monthsAgo++
      console.log(new Date(fromDate), new Date(toDate))

      await setImmediatePromise()
      const results = await SessionModel.updateMany(
        {
          type: { $ne: SUBJECT_TYPES.COLLEGE },
          createdAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }
        },
        {
          $unset: {
            hasWhiteboardDoc: ''
          }
        }
      )
      console.log(results)
    }
  } catch (error) {
    console.error(error)
  }

  mongoose.disconnect()
}

// To run the migration:
// npx ts-node dbutils/add-has-whiteboard-doc.ts

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node dbutils/add-has-whiteboard-doc.ts
if (process.env.DOWNGRADE) {
  downgrade()
} else {
  upgrade()
}
