import mongoose, { Types } from 'mongoose'
import StudentModel, { Student } from '../models/Student'
import * as db from '../db'
import { School } from '../models/School'
import { getSchool } from '../services/SchoolService'
import * as AnalyticsService from '../services/AnalyticsService'
import { getIdFromModelReference } from '../utils/model-reference'

async function addPartnerTrackingToStudents(students: Student[]) {
  const userProperties: AnalyticsService.IdentifyProperties = {}
  for (const student of students) {
    let school: School | undefined
    if (student.approvedHighschool) {
      school = await getSchool(
        getIdFromModelReference(student.approvedHighschool)
      )
    }

    // add schoolPartner prop if student is school partner student
    if (school && school.isPartner) {
      userProperties.schoolPartner = school.name
    }

    if(student.studentPartnerOrg){
      userProperties.partner = student.studentPartnerOrg
    }

    AnalyticsService.identify(student._id, userProperties)
  }
}

async function backfillStudentPartners(): Promise<void> {
  let exitCode = 0
  try {
    await db.connect()

    const students = await StudentModel.aggregate([
      {
        $lookup: {
          from: 'schools',
          localField: 'approvedHighschool',
          foreignField: '_id',
          as: 'highschool',
        },
      },
      {
        $unwind: {
          path: '$highschool',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            { 'highschool.isPartner': true },
            {
              studentPartnerOrg: {
                $exists: true,
              },
            },
          ],
          lastActivityAt: { $gte: new Date('2021-01-01T00:00:00.000+00:00') },
        },
      },
    ])

    addPartnerTrackingToStudents(students)
  } catch (error) {
    console.log('error', error)
    exitCode = 1
  } finally {
    await mongoose.disconnect()
    process.exit(exitCode)
  }
}

// To run:
// npx ts-node server/dbutils/backfill-school-nonprofit-partner-props-posthog.ts
backfillStudentPartners()
