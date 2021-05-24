import mongoose from 'mongoose'
import FeedbackModel, { FeedbackVersionTwo } from '../models/Feedback'
import { FEEDBACK_VERSIONS } from '../constants'
import dbconnect from './dbconnect'
import logger from '../logger'

async function upgrade(): Promise<void> {
  try {
    await dbconnect()

    // Remove the responseData key from all feedback documents with versionNumber: 2
    const results = await FeedbackModel.updateMany(
      {
        $or: [
          { versionNumber: FEEDBACK_VERSIONS.TWO },
          { studentTutoringFeedback: { $exists: true } },
          { studentCounselingFeedback: { $exists: true } },
          { volunteerFeedback: { $exists: true } }
        ]
      },
      {
        $unset: {
          responseData: ''
        }
      }
    )

    logger.info(results)
  } catch (error) {
    logger.error(error)
  }

  mongoose.disconnect()
}

async function downgrade(): Promise<void> {
  try {
    await dbconnect()

    // Add responseData to docs with studentTutoringFeedback
    const studentTutoringUpdates = []
    const studentTutoringDocs = (await FeedbackModel.find({
      studentTutoringFeedback: { $exists: true }
    })
      .lean()
      .exec()) as FeedbackVersionTwo[]

    for (const doc of studentTutoringDocs) {
      studentTutoringUpdates.push(
        FeedbackModel.updateOne(
          { _id: doc._id },
          {
            responseData: doc.studentTutoringFeedback
          }
        )
      )
    }

    const studentTutoringFeedbackResults = await Promise.all(
      studentTutoringUpdates
    )

    logger.info(
      `Added responseData from studentTutoringFeedback to a total of ${studentTutoringFeedbackResults.length} docs`
    )

    // Add responseData to docs with studentCounselingFeedback
    const studentCounselingUpdates = []
    const studentCounselingDocs = (await FeedbackModel.find({
      studentCounselingFeedback: { $exists: true }
    })
      .lean()
      .exec()) as FeedbackVersionTwo[]

    for (const doc of studentCounselingDocs) {
      studentCounselingUpdates.push(
        FeedbackModel.updateOne(
          { _id: doc._id },
          {
            responseData: doc.studentCounselingFeedback
          }
        )
      )
    }

    const studentCounselingFeedbackResults = await Promise.all(
      studentCounselingUpdates
    )

    logger.info(
      `Added responseData from studentCounselingFeedback to a total of ${studentCounselingFeedbackResults.length} docs`
    )

    // Add responseData to docs with volunteerFeedback
    const volunteerFeedbackUpdates = []
    const volunteerFeedbackDocs = (await FeedbackModel.find({
      volunteerFeedback: { $exists: true }
    })
      .lean()
      .exec()) as FeedbackVersionTwo[]

    for (const doc of volunteerFeedbackDocs) {
      volunteerFeedbackUpdates.push(
        FeedbackModel.updateOne(
          { _id: doc._id },
          {
            responseData: doc.volunteerFeedback
          }
        )
      )
    }

    const volunteerFeedbackResults = await Promise.all(volunteerFeedbackUpdates)

    logger.info(
      `Added responseData from volunteerFeedback to a total of ${volunteerFeedbackResults.length} docs`
    )
  } catch (error) {
    logger.error(error)
  }

  mongoose.disconnect()
}

// To run migration:
// npx ts-node server/dbutils/remove-response-data-from-feedback.ts

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node server/dbutils/remove-response-data-from-feedback.ts
if (process.env.DOWNGRADE) {
  downgrade()
} else {
  upgrade()
}
