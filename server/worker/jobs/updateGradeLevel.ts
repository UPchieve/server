import { Jobs } from '.'
import 'moment-timezone'
import { log } from '../logger'
import {
  getStudentsForGradeLevelUpdate,
  updateStudentsGradeLevel,
} from '../../models/Student'
import { GRADES } from '../../constants'
import { createContact } from '../../services/MailService'
import moment from 'moment'

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
  const oldestDate = '2017-01-01T00:00:00.000+00:00'
  let monthsAgo = 0
  let toDate = moment()
    .utc()
    .endOf('month')
    .format('YYYY-MM-DD HH:mm:ss')
  let totalUpdated = 0

  while (toDate >= oldestDate) {
    const fromDate = moment()
      .utc()
      .subtract(monthsAgo, 'months')
      .startOf('month')
      .format('YYYY-MM-DD HH:mm:ss')
    toDate = moment()
      .utc()
      .subtract(monthsAgo, 'months')
      .endOf('month')
      .format('YYYY-MM-DD HH:mm:ss')

    const students = await getStudentsForGradeLevelUpdate(fromDate, toDate)
    log(`Executed ${Jobs.UpdateGradeLevel} on ${fromDate} - ${toDate}`)

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

    monthsAgo++
  }

  log(`Successfully ${Jobs.UpdateGradeLevel} for ${totalUpdated} students`)

  if (errors.length) {
    throw new Error(
      `Failed to ${Jobs.UpdateGradeLevel} for students:\n${errors}`
    )
  }
}
