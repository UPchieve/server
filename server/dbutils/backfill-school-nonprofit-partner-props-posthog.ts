import mongoose, { Types } from 'mongoose'
import StudentModel, { Student } from '../models/Student'
import * as db from '../db'
import { School } from '../models/School'
import { getSchool } from '../services/SchoolService'
import * as AnalyticsService from '../services/AnalyticsService'

async function addPartnerTrackingToStudents(students: Student[]) {
  for (const student of students) {
    let school: School | undefined
    if (
      student.approvedHighschool &&
      student.approvedHighschool instanceof Types.ObjectId
    ) {
      school = await getSchool(student.approvedHighschool)
    } else school = student.approvedHighschool

    if (student.studentPartnerOrg && school && school.isPartner) {
      const highSchool = school.nameStored ? school.nameStored : school.SCH_NAME
      AnalyticsService.identify(student._id, {
        schoolPartner: highSchool,
      })
    }
    // if update student is partner student but non profit partner student
    else if (student.studentPartnerOrg)
      AnalyticsService.identify(student._id, {
        nonProfitPartner: student.studentPartnerOrg,
      })
  }
}

async function backfillStudentPartners(): Promise<void> {
  try {
    await db.connect()

    const students = await StudentModel.find({
      studentPartnerOrg: {
        $exists: true,
      },
      lastActivityAt: { $gte: new Date('2021-01-01T00:00:00.000+00:00') },
    }).lean().exec()

    addPartnerTrackingToStudents(students)
  } catch (error) {
    console.log('error', error)
  }

  mongoose.disconnect()
}

// To run:
// npx ts-node server/dbutils/backfill-school-nonprofit-partner-props-posthog.ts
backfillStudentPartners()
