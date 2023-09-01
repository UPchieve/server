import { Jobs } from '.'
import 'moment-timezone'
import { log } from '../logger'
import {
  getStudentsForGradeLevelUpdate,
  updateStudentsGradeLevel,
} from '../../models/Student'
import { GRADES } from '../../constants'
import { createContact } from '../../services/MailService'

const gradeLevelMapping: Record<number, GRADES> = {
  6: GRADES.SIXTH,
  7: GRADES.SEVENTH,
  8: GRADES.EIGHTH,
  9: GRADES.NINTH,
  10: GRADES.TENTH,
  11: GRADES.ELEVENTH,
  12: GRADES.TWELVETH,
}

function getNextGradeLevel(currentGrade: string): GRADES | undefined {
  const grade = parseInt(currentGrade)
  if (!grade) return
  const nextGrade = grade + 1
  if (nextGrade > 12) return GRADES.COLLEGE
  return gradeLevelMapping[nextGrade]
}

export default async (): Promise<void> => {
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
        const newGrade = getNextGradeLevel(student.gradeLevel)
        if (!newGrade) continue
        await updateStudentsGradeLevel(student.userId, newGrade)
        await createContact(student.userId)
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
