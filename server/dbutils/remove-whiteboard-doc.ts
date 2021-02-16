import mongoose from 'mongoose'
import dbconnect from './dbconnect'
import SessionModel from '../models/Session'
import { SUBJECT_TYPES } from '../constants'
import moment from 'moment-timezone'
import util from 'util'
const setImmediatePromise = util.promisify(setImmediate)

const oldestDate = new Date('2017-01-01T00:00:00.000+00:00')

async function main(): Promise<void> {
  try {
    await dbconnect()

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
      // remove whiteboard docs after migration to azure
      const results = await SessionModel.updateMany(
        {
          type: { $ne: SUBJECT_TYPES.COLLEGE },
          createdAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }
        },
        {
          $unset: {
            whiteboardDoc: ''
          }
        }
      )
        .lean()
        .exec()
      console.log(results)
    }
  } catch (error) {
    console.error(error)
  }

  mongoose.disconnect()
}

// npx ts-node dbutils/remove-whiteboard-doc.ts
main()
