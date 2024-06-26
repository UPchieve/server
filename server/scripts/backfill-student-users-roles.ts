import * as db from '../db'
import * as UserRepo from '../models/User'
import { USER_ROLES } from '../constants'
import { logError } from '../worker/logger'

export default async function main() {
  try {
    await db.connect()

    await db.runInTransaction(async tc => {
      await backfill(tc)
    })
  } catch (e) {
    logError(e as Error)
  }
}

export async function backfill(tc: db.TransactionClient) {
  const userIdsResult = await tc.query(`
    SELECT u.id 
    FROM users u
    LEFT JOIN signup_sources ss 
      ON u.signup_source_id = ss.id
    LEFT JOIN users_roles ur
      ON u.id = ur.user_id
    WHERE test_user = false 
      AND ur.role_id IS NULL
      AND ss.name = 'Roster';
  `)
  const userIds = userIdsResult.rows.map(r => r.id)

  // Cache the id mapping of school to student partner org
  // so we don't need to access db for all 1500 students.
  const schoolIdToSpoId: { [key: string]: string } = {}

  for (const id of userIds) {
    await UserRepo.insertUserRoleByUserId(id, USER_ROLES.STUDENT, tc)

    // We need to fill in the student_partner_org_id on the student_profile.
    //   1. Get the school_id from the student_profile.
    //   2. Find the student_partner_org with that school_id.
    //   3. Update the student_profile with the id of that student_partner_org.
    const studentResult = await tc.query(
      `
        SELECT school_id
        FROM student_profiles
        WHERE user_id = $1
      `,
      [id]
    )
    if (studentResult.rows.length !== 1)
      throw new Error('unexpected student result length')

    const studentSchoolId = studentResult.rows[0].school_id
    let studentSpoId
    if (schoolIdToSpoId[studentSchoolId]) {
      studentSpoId = schoolIdToSpoId[studentSchoolId]
    } else {
      const spoResult = await tc.query(
        `
          SELECT id
          FROM student_partner_orgs
          WHERE school_id = $1
        `,
        [studentSchoolId]
      )
      if (spoResult.rows.length !== 1)
        throw new Error('unexpected spo result length')

      studentSpoId = spoResult.rows[0].id
      schoolIdToSpoId[studentSchoolId] = studentSpoId
    }

    await tc.query(
      `
          UPDATE student_profiles
          SET student_partner_org_id = $1
          WHERE user_id = $2;
        `,
      [studentSpoId, id]
    )
  }
}
