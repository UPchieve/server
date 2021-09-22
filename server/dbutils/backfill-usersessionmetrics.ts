import mongoose from 'mongoose'
import * as db from '../db'

import UserModel, { User } from '../models/User'
import { createByUserId } from '../models/UserSessionMetrics'
import { safeAsync } from '../utils/safe-async'

async function main() {
  let exitCode = 0
  try {
    await db.connect()

    const users = await UserModel.aggregate([
      {
        $lookup: {
          from: 'usersessionmetrics',
          localField: '_id',
          foreignField: 'user',
          as: 'usm'
        }
      },
      {
        $match: {
          'usm.0': { $exists: false }
        }
      }
    ]) as unknown as User[]

    console.log(`Attempting to create USM for ${users.length} users`)
    const errors: Error[] = []
    for (const user of users) {
      const { error } = await safeAsync(createByUserId(user._id))
      if (error) {
        console.error(`Error creating USM for ${user._id}`)
        errors.push(error)
      }
    }

    console.log(`Successfully created USM for ${users.length - errors.length} users`)

  } catch (error) {
    console.log(`Uncaught error: ${error}`)
    exitCode = 1
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}

main()
