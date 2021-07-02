import mongoose from 'mongoose'
import * as db from '../db'
import SessionModel from '../models/Session'
import {
  uploadedToStorage,
  getDocFromStorage
} from '../services/WhiteboardService'
import { SUBJECT_TYPES } from '../constants'
import config from '../config'
import util from 'util'
import moment from 'moment-timezone'
const setImmediatePromise = util.promisify(setImmediate)

if (config.whiteboardStorageAccountName === 'bogus') {
  console.log('Enter the proper credentials for the migration to azure')
  process.exit(1)
}

// whiteboard docs prior to this date have a different format that is unusable
const validWhiteboardDocsDate = new Date('2020-11-18T00:00:00.000+00:00')
const currentDate = moment.utc()

// migrate whiteboard docs to azure
async function upgrade(): Promise<void> {
  try {
    await db.connect()

    let fromDate = moment(validWhiteboardDocsDate).utc()

    // batch the update operations by month intervals starting from the start of the valid whiteboard docs date
    while (fromDate <= currentDate) {
      const toDate = moment(fromDate)
        .utc()
        .endOf('month')
      console.log(new Date(fromDate), new Date(toDate))

      await setImmediatePromise()
      // Sessions created after the date where the new whiteboard format was created will have their whiteboard doc moved to azure
      const sessions = await SessionModel.find({
        type: { $ne: SUBJECT_TYPES.COLLEGE },
        createdAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }
      })
        .sort({ createdAt: -1 })
        .select({ _id: 1, whiteboardDoc: 1 })
        .lean()
        .exec()

      const updates = []
      for (const session of sessions) {
        const hasWhiteboardDoc = await uploadedToStorage(
          session._id.toString(),
          session.whiteboardDoc
        )
        updates.push(
          SessionModel.updateOne(
            {
              _id: session._id
            },
            {
              hasWhiteboardDoc
            }
          )
        )
      }
      const results = await Promise.all(updates)
      console.log(results)

      fromDate = moment(fromDate)
        .utc()
        .add(1, 'months')
        .startOf('month')
    }
  } catch (error) {
    console.error(error)
  }

  mongoose.disconnect()
}

// get whiteboard docs from azure and store in to the whiteboardDoc property
async function downgrade(): Promise<void> {
  try {
    await db.connect()

    let fromDate = moment(validWhiteboardDocsDate).utc()

    // batch the update operations by month intervals starting from the start of the valid whiteboard docs date
    while (fromDate <= currentDate) {
      const toDate = moment(fromDate)
        .utc()
        .endOf('month')
      console.log(new Date(fromDate), new Date(toDate))

      await setImmediatePromise()
      const sessions = await SessionModel.find({
        type: { $ne: SUBJECT_TYPES.COLLEGE },
        createdAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }
      })
        .sort({ createdAt: -1 })
        .select({ _id: 1 })
        .lean()
        .exec()

      const updates = []
      for (const session of sessions) {
        const whiteboardDoc = await getDocFromStorage(session._id.toString())
        updates.push(
          SessionModel.updateOne(
            {
              _id: session._id
            },
            {
              whiteboardDoc,
              hasWhiteboardDoc: false
            }
          )
        )
      }
      const results = await Promise.all(updates)
      console.log(results)

      fromDate = moment(fromDate)
        .utc()
        .add(1, 'months')
        .startOf('month')
    }
  } catch (error) {
    console.error(error)
  }

  mongoose.disconnect()
}

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node dbutils/migrate-whiteboard-docs-to-azure.ts
if (process.env.DOWNGRADE) {
  downgrade()
} else {
  upgrade()
}
