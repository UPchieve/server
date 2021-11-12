import mongoose from 'mongoose'
import { GRADES, MATH_SUBJECTS } from '../constants'
import * as db from '../db'
import logger from '../logger'
import StudentModel from '../models/Student'
import UserProductFlagsModel from '../models/UserProductFlags'

// Run:
// npx ts-node server/dbutils/backfill-gates-students.ts
async function upgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()

    const eligibleStudents = await StudentModel.aggregate([
      {
        $match: {
          studentPartnerOrg: {
            $exists: false,
          },
          currentGrade: { $in: [GRADES.NINTH, GRADES.TENTH] },
        },
      },
      {
        $lookup: {
          from: 'schools',
          localField: 'approvedHighschool',
          foreignField: '_id',
          as: 'highSchool',
        },
      },
      {
        $unwind: '$highSchool',
      },
      {
        $match: {
          'highSchool.isPartner': false,
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
    ])

    const eligibleStudentIds = eligibleStudents.map(student => student._id)

    logger.info(
      `Attempting to update gatesQualified for ${eligibleStudentIds.length} students`
    )

    await UserProductFlagsModel.updateMany(
      { user: { $in: eligibleStudentIds } },
      { gatesQualified: true }
    )
    logger.info(
      `Successfully updated gatesQualified for ${eligibleStudentIds.length} students`
    )
  } catch (error) {
    logger.error(error)
    exitCode = 1
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}

async function downgrade(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()
    const gatesQualifiedFlags = await UserProductFlagsModel.aggregate([
      {
        $match: { gatesQualified: true },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $lookup: {
          from: 'sessions',
          localField: 'user.pastSessions',
          foreignField: '_id',
          as: 'user.pastSessions',
        },
      },
      {
        $project: {
          student: '$user',
        },
      },
    ])

    const notQualifiedStudentIds = []

    /**
     * Previosuly, a Gates-qualified session is defined as a session with the following:
     *
     * - Not a school partner student
     * - Not a nonprofit partner student
     * - Brand new student, must be first session on the platform
     * - In 9th grade or 10th grade
     * - Not reported by time of ending
     * - Math tutoring session
     *
     * We can assume that if they already have a gates qualified flag,
     * they are not a partner student or from a partner school, and
     * that they are in 9th or 10th grade. The only checks that need to be
     * made are that their first session was a math tutoring session, and
     * that it was not reported
     */
    for (const { student } of gatesQualifiedFlags) {
      const firstSession = student.pastSessions[0]
      if (!firstSession) notQualifiedStudentIds.push(student._id)
      else if (
        firstSession.isReported ||
        !Object.values<string>(MATH_SUBJECTS).includes(firstSession.subTopic)
      )
        notQualifiedStudentIds.push(student._id)
    }

    logger.info(
      `Attempting to downgrade gatesQualified for ${notQualifiedStudentIds.length} students`
    )

    await UserProductFlagsModel.updateMany(
      { user: { $in: notQualifiedStudentIds } },
      { gatesQualified: false }
    )

    logger.info(
      `Successfully downgraded gatesQualified for ${notQualifiedStudentIds.length} students`
    )
  } catch (error) {
    logger.error(error)
    exitCode = 1
  } finally {
    mongoose.disconnect()
    process.exit(exitCode)
  }
}

// Run:
// DOWNGRADE = true npx ts-node server/dbutils/backfill-gates-students.ts
if (process.env.DOWNGRADE) {
  downgrade()
} else {
  upgrade()
}
