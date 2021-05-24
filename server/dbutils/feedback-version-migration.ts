import mongoose from 'mongoose'
import FeedbackModel, { FeedbackVersionOne } from '../models/Feedback'
import { FEEDBACK_VERSIONS } from '../constants'
import dbconnect from './dbconnect'
import logger from '../logger'

async function upgrade(): Promise<void> {
  try {
    await dbconnect()

    // Adds versionNumber: 1
    const versionNumberOneResults = await FeedbackModel.updateMany(
      {
        $or: [
          // All feeedback from volunteers will have versionNumber: 1 while subsequent
          // feedback from volunteers following this migration will have versionNumber: 2
          {
            $and: [
              { userType: 'volunteer' },
              { volunteerFeedback: { $exists: false } }
            ]
          },
          // All legacy keys found in responseData will have versionNumber: 1
          { 'responseData.session-experience': { $exists: true } },
          { 'responseData.rate-upchieve': { $exists: true } },
          { 'responseData.rate-coach': { $exists: true } },
          { 'responseData.technical-difficulties': { $exists: true } },
          { 'responseData.asked-unprepared-questions': { $exists: true } },
          { 'responseData.app-features-needed': { $exists: true } },
          { 'responseData.session-goal': { $exists: true } },
          { 'responseData.coach-ratings': { $exists: true } },
          { 'responseData.rate-session': { $exists: true } },
          { 'responseData.other-feedback': { $exists: true } },
          // All tutor related(math or science) feedback from students BEFORE the new
          // feedback UI was implemented will have versionNumber: 1
          {
            $and: [
              {
                userType: 'student'
              },
              { type: { $in: ['math', 'science'] } },
              {
                createdAt: {
                  $lt: new Date('2020-09-30T23:31:08.965+00:00')
                }
              }
            ]
          }
        ]
      },
      { $set: { versionNumber: FEEDBACK_VERSIONS.ONE } }
    )

    logger.info('Added versionNumber: 1', versionNumberOneResults)

    // All tutor related(math or science) feedback from students AFTER the new
    // feedback UI was implemented will have versionNumber: 2
    // Adds studentTutoringFeedback
    const studentTutoringUpdates = []
    const studentTutoringDocs = (await FeedbackModel.find({
      userType: 'student',
      type: { $in: ['math', 'science'] },
      createdAt: { $gte: new Date('2020-09-30T23:31:08.965+00:00') },
      'responseData.rate-session': { $exists: false },
      studentTutoringFeedback: { $exists: false }
    })
      .lean()
      .exec()) as FeedbackVersionOne[]

    for (const doc of studentTutoringDocs) {
      studentTutoringUpdates.push(
        FeedbackModel.updateOne(
          { _id: doc._id },
          {
            studentTutoringFeedback: doc.responseData
          }
        )
      )
    }

    const studentTutoringFeedbackResults = await Promise.all(
      studentTutoringUpdates
    )

    logger.info(
      `Added studentTutoringFeedback to a total of ${studentTutoringFeedbackResults.length} docs`
    )

    // Adds studentCounselingFeedback
    const studentCounselingUpdates = []
    const studentCounselingDocs = (await FeedbackModel.find({
      userType: 'student',
      type: 'college',
      studentCounselingFeedback: { $exists: false }
    })
      .lean()
      .exec()) as FeedbackVersionOne[]

    for (const doc of studentCounselingDocs) {
      studentCounselingUpdates.push(
        FeedbackModel.updateOne(
          { _id: doc._id },
          {
            studentCounselingFeedback: doc.responseData
          }
        )
      )
    }

    const studentCounselingFeedbackResults = await Promise.all(
      studentCounselingUpdates
    )

    logger.info(
      `Added studentCounselingFeedback to a total of ${studentCounselingFeedbackResults.length} docs`
    )

    // Adds volunteerFeedback
    const volunteerFeedbackUpdates = []
    const volunteerFeedbackDocs = (await FeedbackModel.find({
      userType: 'volunteer',
      $or: [
        { 'responseData.session-enjoyable': { $exists: true } },
        { 'responseData.session-improvements': { $exists: true } },
        { 'responseData.student-understanding': { $exists: true } },
        { 'responseData.session-obstacles': { $exists: true } }
      ],
      volunteerFeedback: { $exists: false }
    })
      .lean()
      .exec()) as FeedbackVersionOne[]

    for (const doc of volunteerFeedbackDocs) {
      volunteerFeedbackUpdates.push(
        FeedbackModel.updateOne(
          { _id: doc._id },
          {
            volunteerFeedback: doc.responseData
          }
        )
      )
    }

    const volunteerFeedbackResults = await Promise.all(volunteerFeedbackUpdates)

    logger.info(
      `Added volunteerFeedback to a total of ${volunteerFeedbackResults.length} docs`
    )

    const versionNumberResults = await FeedbackModel.updateMany(
      {
        $or: [
          { studentTutoringFeedback: { $exists: true } },
          { studentCounselingFeedback: { $exists: true } },
          { volunteerFeedback: { $exists: true } }
        ]
      },
      {
        versionNumber: FEEDBACK_VERSIONS.TWO
      }
    )

    logger.info(`Added versionNumber: 2 to ${versionNumberResults}`)
  } catch (error) {
    logger.error(error)
  }

  mongoose.disconnect()
}

async function downgrade(): Promise<void> {
  try {
    await dbconnect()
    const results = await FeedbackModel.updateMany(
      {},
      {
        $unset: {
          versionNumber: '',
          studentTutoringFeedback: '',
          studentCounselingFeedback: '',
          volunteerFeedback: ''
        }
      }
    )
    logger.info(`Updated: ${results}`)
  } catch (error) {
    logger.error(error)
  }

  mongoose.disconnect()
}

// To run migration:
// npx ts-node server/dbutils/feedback-version-migration.ts

// To downgrade the migration run:
// DOWNGRADE=true npx ts-node server/dbutils/feedback-version-migration.ts
if (process.env.DOWNGRADE) {
  downgrade()
} else {
  upgrade()
}
