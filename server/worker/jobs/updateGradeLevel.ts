import { Job } from 'bull'
import { Jobs } from '.'
import moment from 'moment'
import 'moment-timezone'
import { log } from '../logger'
import {
  getStudentsForGradeLevelUpdate,
  updateStudentsGradeLevel,
} from '../../models/Student'
import { GRADES } from '../../constants'
import { asBoolean } from '../../utils/type-utils'

type UpdateGradeLevelData = {
  isInitialRun: boolean
}

const gradeLevelMapping: Record<number, GRADES> = {
  6: GRADES.SIXTH,
  7: GRADES.SEVENTH,
  8: GRADES.EIGHTH,
  9: GRADES.NINTH,
  10: GRADES.TENTH,
  11: GRADES.ELEVENTH,
  12: GRADES.TWELVETH,
}

// We're defining a school year as 8/1/year - 7/31/year + 1
function processNextGradeJump(createdAt: Date) {
  const createdDate = moment(createdAt, 'YYYY-MM-DD HH:mm:ss')

  let gradeJumps = 0
  if (
    createdDate.isAfter('2020-08-01 00:00:00.000000+00') &&
    createdDate.isBefore('2021-07-01 00:00:00.000000+00')
  )
    gradeJumps = 3
  else if (
    createdDate.isAfter('2021-08-01 00:00:00.000000+00') &&
    createdDate.isBefore('2022-07-01 00:00:00.000000+00')
  )
    gradeJumps = 2
  else if (
    createdDate.isAfter('2022-08-01 00:00:00.000000+00') &&
    createdDate.isBefore('2023-07-01 00:00:00.000000+00')
  )
    gradeJumps = 1

  return gradeJumps
}

function getNextGradeLevel(
  isInitialRun: boolean = false,
  createdAt: Date,
  currentGrade: string
): GRADES | undefined {
  let jump = 1
  if (isInitialRun) jump = processNextGradeJump(createdAt)
  if (!jump) return

  const grade = parseInt(currentGrade)
  if (!grade) return
  const nextGrade = grade + jump
  if (nextGrade > 12) return GRADES.COLLEGE
  return gradeLevelMapping[grade + jump]
}

export default async (job: Job<UpdateGradeLevelData>): Promise<void> => {
  const errors: string[] = []
  let limit = 5000
  let count = 0
  let offset = 0
  let totalUpdated = 0

  while (true) {
    const students = await getStudentsForGradeLevelUpdate(limit, offset)
    if (!students || !students.length) break
    log(
      `Executed ${Jobs.UpdateGradeLevel} on LIMIT ${limit} and OFFSET ${offset}`
    )

    for (const student of students) {
      try {
        const newGrade = getNextGradeLevel(
          asBoolean(job.data.isInitialRun),
          student.createdAt,
          student.gradeLevel
        )
        if (!newGrade) continue
        await updateStudentsGradeLevel(student.userId, newGrade)
        totalUpdated++
      } catch (error) {
        errors.push(
          `${student.userId}: Attempted to update grade: ${student.gradeLevel} with error: ${error}\n`
        )
        continue
      }
    }

    count++
    offset = count * limit
  }

  log(`Successfully ${Jobs.UpdateGradeLevel} for ${totalUpdated} students`)

  if (errors.length) {
    throw new Error(
      `Failed to ${Jobs.UpdateGradeLevel} for students:\n${errors}`
    )
  }
}
