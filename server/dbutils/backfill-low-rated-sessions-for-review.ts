import mongoose from 'mongoose'
import { USER_SESSION_METRICS } from '../constants'
import * as db from '../db'
import logger from '../logger'

import SessionModel, { updateReviewReasons } from '../models/Session'
import { safeAsync } from '../utils/safe-async'

async function main() {
  let exitCode = 0
  try {
    await db.connect()

    const lowRatingFlags = [
      USER_SESSION_METRICS.lowCoachRatingFromStudent,
      USER_SESSION_METRICS.lowSessionRatingFromCoach,
      USER_SESSION_METRICS.lowSessionRatingFromStudent
    ]
    const errors: Error[] = []
    const sessions = await SessionModel.find({
      flags: {
        $in: lowRatingFlags
      },
      reviewed: false
    })
      .sort({ createdAt: -1 })
      .lean()
      .exec()

    logger.info(
      `Attempting to backfill review reasons for ${sessions.length} sessions`
    )

    for (const session of sessions) {
      const reviewReasons = []
      for (const flag of session.flags) {
        if (lowRatingFlags.includes(flag as USER_SESSION_METRICS))
          reviewReasons.push(flag)
      }

      const { error } = await safeAsync(
        updateReviewReasons(session._id, reviewReasons)
      )
      if (error) {
        logger.error(`Error backfilling review reasons for ${session._id}`)
        errors.push(error)
      }
    }

    logger.info(
      `Successfully backfilled review reasons for ${sessions.length -
        errors.length} sessions`
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
