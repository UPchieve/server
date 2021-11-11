import mongoose from 'mongoose'
import * as db from '../db'
import UserModel, { User } from '../models/User'
import { createByUserId } from '../models/UserProductFlags'
import { safeAsync } from '../utils/safe-async'
import logger from '../logger'

async function main() {
  let exitCode = 0
  try {
    await db.connect()

    const users = ((await UserModel.aggregate([
      {
        $lookup: {
          from: 'userproductflags',
          localField: '_id',
          foreignField: 'user',
          as: 'userProductFlags'
        }
      },
      {
        $match: {
          'userProductFlags.0': { $exists: false }
        }
      }
    ])) as unknown) as User[]

    logger.info(
      `Attempting to create UserProductFlags doc for ${users.length} users`
    )
    const errors: Error[] = []
    for (const user of users) {
      const { error } = await safeAsync(createByUserId(user._id))
      if (error) {
        logger.error(`Error creating a UserProductFlags doc for ${user._id}`)
        errors.push(error)
      }
    }

    logger.info(
      `Successfully created UserProductFlags docs for ${users.length -
        errors.length} users`
    )
  } catch (error) {
    logger.info(`Uncaught error: ${error}`)
    exitCode = 1
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}

main()
