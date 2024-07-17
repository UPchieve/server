import * as db from '../db'
import { RosterStudentPayload } from '../services/UserCreationService'
import { hashPassword } from '../utils/auth-utils'
import { readCsvFromFilePath } from '../utils/file-utils'

async function main() {
  let exitCode = 0
  try {
    await db.connect()

    const filePath = `update-roster-students.csv`
    const students = readCsvFromFilePath<
      Required<Pick<RosterStudentPayload, 'gradeLevel' | 'email' | 'password'>>
    >(filePath, ['gradeLevel', 'email', 'password'])

    const failedUsers = []

    for (const student of students) {
      try {
        await db.runInTransaction(async tc => {
          const password = await hashPassword(student.password)
          const userResult = await tc.query(
            'UPDATE users SET password = $1, password_reset_token = null, created_at = NOW(), updated_at = NOW(), last_activity_at = NOW() WHERE email = $2 RETURNING id',
            [password, student.email.toLowerCase()]
          )
          const userId = userResult.rows[0].id
          const gradeLevelResult = await tc.query(
            'SELECT id FROM grade_levels WHERE name = $1',
            [parseInt(student.gradeLevel).toFixed(0) + 'th']
          )
          const gradeLevelId = gradeLevelResult.rows[0].id
          await tc.query(
            'UPDATE student_profiles SET grade_level_id = $1, created_at = NOW(), updated_at = NOW() WHERE user_id = $2',
            [gradeLevelId, userId]
          )
          await tc.query(
            'UPDATE user_actions SET created_at = NOW(), updated_at = NOW() WHERE user_id = $1',
            [userId]
          )
        })
      } catch {
        failedUsers.push({
          email: student.email,
        })
      }
    }

    console.log(`Completed with ${failedUsers.length} errors.`)
    if (failedUsers.length) {
      console.log(`Failed user emails: ${failedUsers.join(', ')}`)
    }
  } catch (error) {
    console.log(`Uncaught error: ${error}`)
    exitCode = 1
  } finally {
    await db.closeClient()
    process.exit(exitCode)
  }
}

main()
