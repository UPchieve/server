import mongoose, { Types } from 'mongoose'
import StudentModel, { Student } from '../models/Student'
import * as db from '../db'
import { School } from '../models/School'
import { getSchool } from '../services/SchoolService'
import * as AnalyticsService from '../services/AnalyticsService'
import { getIdFromModelReference } from '../utils/model-reference'

async function addPartnerTrackingToStudents(students: Student[]) {
  var userProperties: any = {}
  for (const student of students) {
    let school: School | undefined
    if (
      student.approvedHighschool &&
      student.approvedHighschool instanceof Types.ObjectId
    ) {
      school = await getSchool(
        getIdFromModelReference(student.approvedHighschool)
      )
    } else school = student.approvedHighschool

    let schoolName
    if (school)
      schoolName = school.nameStored ? school.nameStored : school.SCH_NAME

    // if student is school partner student
    if (school && school.isPartner) {
      // if student also belongs to a partner org
      if (student.studentPartnerOrg) {
        userProperties.schoolPartner = schoolName
        userProperties.partner = student.studentPartnerOrg
      }
      // if student is only school partner student but does not belong to a partner org
      else userProperties.schoolPartner = schoolName
    }
    // if student is partner org student but not a school partner student, no need to do anything since partner prop already exists

    AnalyticsService.identify(student._id, userProperties)
  }
}

async function backfillStudentPartners(): Promise<void> {
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
  }

  mongoose.disconnect()
}

// To run:
// npx ts-node server/dbutils/backfill-school-nonprofit-partner-props-posthog.ts
backfillStudentPartners()
