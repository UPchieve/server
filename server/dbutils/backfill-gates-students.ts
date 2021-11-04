import mongoose from 'mongoose'
import { GRADES, MATH_SUBJECTS } from '../constants'
import * as db from '../db'
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
        $unwind: {
          path: '$highSchool',
          preserveNullAndEmptyArrays: true,
        },
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

    await UserProductFlagsModel.updateMany(
      { user: { $in: eligibleStudentIds } },
      { gatesQualified: true }
    )
  } catch (error) {
    console.error(error)
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
    const qualifiedStudents = await UserProductFlagsModel.aggregate([
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
        $unwind: {
          path: '$user',
        },
      },
      {
        $lookup: {
          from: 'sessions',
          localField: 'user.pastSessions',
          foreignField: '_id',
          as: 'pastSessions',
        },
      },
      {
        $project: {
          pastSessions: 1,
          user: 1,
        },
      },
    ])

    const notQualifiedStudentIds = []

    for (const student of qualifiedStudents) {
      const firstSession = student.pastSessions[0]
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
      if (
        firstSession.isReported ||
        !Object.values<string>(MATH_SUBJECTS).includes(firstSession.subTopic)
      )
        notQualifiedStudentIds.push(student._id)
    }

    await UserProductFlagsModel.updateMany(
      { user: { $in: notQualifiedStudentIds } },
      { gatesQualified: false }
    )
  } catch (error) {
    console.error(error)
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
