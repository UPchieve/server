import moment from 'moment'
import { Job } from 'bull'
import { runInTransaction, TransactionClient } from '../../db'
import { Ulid } from '../../models/pgUtils'
import * as AwsService from '../../services/AwsService'
import * as MailService from '../../services/MailService'
import config from '../../config'
import { ACCOUNT_USER_ACTIONS } from '../../constants'
import { createAccountAction } from '../../models/UserAction'
import logger from '../../logger'

type DeidentifyUserJob = {
  userId: Ulid
  forceDelete?: boolean
}
export default async (job: Job<DeidentifyUserJob>): Promise<void> => {
  const userId = job.data.userId
  const forceDelete = job.data.forceDelete ?? false

  await runInTransaction(async (tc: TransactionClient) => {
    const userResult = await tc.query(
      'SELECT email, ban_type FROM users WHERE id = $1',
      [userId]
    )
    const users = userResult.rows
    if (!users.length) {
      throw new Error(`Failed to deidentify user: User ${userId} not found.`)
    }
    const user = users[0]

    if (user.ban_type && !forceDelete) {
      throw new Error(
        `Failed to deidentify user: User ${userId} is currently banned. Verify their sessions and media content before continuing with deletion.`
      )
    }

    // Logout the user from all their active sessions.
    await tc.query(`DELETE FROM auth.session WHERE sess::jsonb @> $1`, [
      JSON.stringify({ passport: { user: userId } }),
    ])

    await MailService.deleteContactByEmail(user.email)
    const photoIdKeyResult = await tc.query(
      'SELECT photo_id_s3_key FROM volunteer_profiles WHERE user_id = $1',
      [userId]
    )
    if (photoIdKeyResult.rows.length) {
      const photoIdKey = photoIdKeyResult.rows[0].photo_id_s3_key
      if (photoIdKey) {
        await AwsService.deleteObject(config.awsS3.photoIdBucket, photoIdKey)
      }
    }

    await hardDeleteRows(userId, tc)
    await deidentifyRows(userId, user.email, tc)

    await createAccountAction(
      {
        action: ACCOUNT_USER_ACTIONS.DELETED,
        userId,
      },
      tc
    )
    await tc.query(`UPDATE users SET deleted = true WHERE id = $1`, [userId])
  })

  logger.info({ userId }, 'Successfully deidentified user.')
}

async function hardDeleteRows(userId: Ulid, tc: TransactionClient) {
  await Promise.all([
    tc.query('DELETE FROM admin_profiles WHERE user_id = $1', [userId]),
    tc.query('DELETE FROM push_tokens WHERE user_id = $1', [userId]),
    tc.query('DELETE FROM users_ip_addresses WHERE user_id = $1', [userId]),
  ])
}

async function deidentifyRows(
  userId: Ulid,
  email: string,
  tc: TransactionClient
) {
  await tc.query(
    `UPDATE contact_form_submissions SET user_email = null WHERE user_id = $1`,
    [userId]
  )
  // The federated_crendentials(id, issuer) act as primary key, meaning we can't have dupes.
  // For the few cases where we have duplicate (issuer, user_id), delete one of the rows
  // first so we can anonymize by setting the id (i.e. profile id, received from SSO provider)
  // just to the user's id.
  await tc.query(
    `DELETE FROM federated_credentials fc1
     USING federated_credentials fc2
     WHERE fc1.user_id = $1
       AND fc2.user_id = $1
       AND fc1.issuer = fc2.issuer
       AND fc1.id < fc2.id`,
    [userId]
  )
  await tc.query(
    `UPDATE federated_credentials SET id = $1 WHERE user_id = $1`,
    [userId]
  )
  await tc.query(`UPDATE ineligible_students SET email = '' WHERE email = $1`, [
    email,
  ])
  await tc.query(
    `UPDATE user_actions SET ip_address_id = null, reference_email = null WHERE user_id = $1`,
    [userId]
  )
  await tc.query(
    `UPDATE volunteer_references SET first_name = '', last_name = '', email = '', affiliation = null, relationship_length = null, rejection_reason = null, additional_info = null WHERE user_id = $1`,
    [userId]
  )

  const parentsGuardiansResult = await tc.query(
    `SELECT parents_guardians_id FROM parents_guardians_students WHERE students_id = $1`,
    [userId]
  )
  for (const pg of parentsGuardiansResult.rows) {
    const otherPgStudents = (
      await tc.query(
        `SELECT students_id FROM parents_guardians_students WHERE parents_guardians_id = $1 AND students_id != $2`,
        [pg.parents_guardians_id, userId]
      )
    ).rows

    if (!otherPgStudents.length) {
      await tc.query(`UPDATE parents_guardians SET email = '' WHERE id = $1`, [
        pg.parents_guardians_id,
      ])
    }
  }

  await tc.query(
    `UPDATE student_profiles SET
    college = null,
    school_id = null,
    postal_code = null,
    student_partner_org_user_id = null,
    student_partner_org_id = null,
    student_partner_org_site_id = null,
    updated_at = NOW()
    WHERE user_id = $1`,
    [userId]
  )
  await tc.query(
    `UPDATE volunteer_profiles SET
    volunteer_partner_org_id = null,
    timezone = null,
    photo_id_s3_key = null,
    linkedin_url = null,
    college = null,
    company = null,
    city = null,
    state = null,
    country = null,
    updated_at = NOW()
    WHERE user_id = $1`,
    [userId]
  )
  await tc.query(
    `UPDATE teacher_profiles SET
    school_id = null,
    last_successful_clever_sync = null,
    updated_at = NOW()
    WHERE user_id = $1`,
    [userId]
  )

  // If the user was a partner student, we still want to know that they _were_ a partner student, and we still
  // want to know the partner org _had_ a partner student, just remove reference to the specific student.
  // We do this by:
  //   1. Remove reference to the student partner org on the original `users_student_partner_orgs_instances`, and
  //      instead reference one of the dummy orgs.
  //     - Allows us to know the student was a partner student, but not to which org specifically.
  //   2. Add a new `users_student_partner_orgs_instances` for the partner orgs, but not referencing any user, and
  //      with the `created_at` and `deactivated_at` truncated to the start of the week.
  //     - Allows us to know the partner org had a partner student, but without the possibility of re-identifying the
  //       partnership of the student.
  // Since the `users.created_at` and `users_student_partner_orgs_instances.created_at` are nearly always identical, if we didn't
  // change these dates when adding the new `users_student_partner_orgs_instances`, it could be really easy to figure out
  // which partner orgs the student was part of just by matching these dates to the `users.created_at`. For partner analytics,
  // we don't really need greater granularity than sign-ups per week.
  const spoInstancesResult = await tc.query(
    `SELECT uspoi.*, spo.school_id FROM users_student_partner_orgs_instances uspoi JOIN student_partner_orgs spo ON uspoi.student_partner_org_id = spo.id WHERE user_id = $1`,
    [userId]
  )
  if (spoInstancesResult.rows.length) {
    const dummySchoolSpoResult = await tc.query(
      `SELECT id FROM student_partner_orgs WHERE name = $1`,
      ['Dummy School Org']
    )
    const dummySpoResult = await tc.query(
      `SELECT id FROM student_partner_orgs WHERE name = $1`,
      ['Dummy Org']
    )

    for (const instance of spoInstancesResult.rows) {
      const dummyId = instance.school_id
        ? dummySchoolSpoResult.rows[0].id
        : dummySpoResult.rows[0].id
      await tc.query(
        `
         UPDATE users_student_partner_orgs_instances
         SET student_partner_org_id = $1, student_partner_org_site_id = NULL
         WHERE user_id = $2 AND student_partner_org_id = $3
       `,
        [dummyId, userId, instance.student_partner_org_id]
      )

      await tc.query(
        `INSERT INTO users_student_partner_orgs_instances (student_partner_org_id, student_partner_org_site_id, deactivated_on, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $4)`,
        [
          instance.student_partner_org_id,
          instance.student_partner_org_site_id,
          moment(instance.deactivated_on).startOf('isoWeek').toISOString(),
          moment(instance.created_at).startOf('isoWeek').toISOString(),
        ]
      )
    }
  }

  // Same as above, just if a user was a volunteer partner.
  const vpoInstancesResult = await tc.query(
    `SELECT * FROM users_volunteer_partner_orgs_instances WHERE user_id = $1`,
    [userId]
  )
  if (vpoInstancesResult.rows.length) {
    const dummyVpoResult = await tc.query(
      `SELECT id FROM volunteer_partner_orgs WHERE name = $1`,
      ['Dummy Org']
    )
    const dummyVpoId = dummyVpoResult.rows[0].id

    for (const instance of vpoInstancesResult.rows) {
      await tc.query(
        `
         UPDATE users_volunteer_partner_orgs_instances
         SET volunteer_partner_org_id = $1
         WHERE user_id = $2 AND volunteer_partner_org_id = $3
       `,
        [dummyVpoId, userId, instance.volunteer_partner_org_id]
      )

      await tc.query(
        `INSERT INTO users_volunteer_partner_orgs_instances (volunteer_partner_org_id, deactivated_on, created_at, updated_at)
       VALUES ($1, $2, $3, $3)`,
        [
          instance.volunteer_partner_org_id,
          moment(instance.deactivated_on).startOf('isoWeek').toISOString(),
          moment(instance.created_at).startOf('isoWeek').toISOString(),
        ]
      )
    }
  }

  // If a user was referred or had referred someone, we need to break the reference between
  // the two users. Similar to partner orgs, though, we still want to know that a user
  // had been referred (for analytics), or that they had referred someone (for volunteer hours).
  const referredByResult = await tc.query(
    `
      SELECT referred_by FROM referrals WHERE user_id = $1
    `,
    [userId]
  )
  for (const referredBy of referredByResult.rows) {
    await tc.query(
      `
        INSERT INTO referrals (referred_by)
        VALUES ($1)
      `,
      [referredBy.referred_by]
    )
  }
  await tc.query(
    `
    UPDATE referrals SET referred_by = null WHERE user_id = $1
  `,
    [userId]
  )

  const referredUsersResult = await tc.query(
    `
      SELECT user_id FROM referrals WHERE referred_by = $1
    `,
    [userId]
  )
  await tc.query(
    `
    UPDATE referrals SET user_id = null WHERE referred_by = $1
  `,
    [userId]
  )
  for (const referredUser of referredUsersResult.rows) {
    await tc.query(
      `
        INSERT INTO referrals (user_id)
        VALUES ($1)
      `,
      [referredUser.user_id]
    )
  }

  await tc.query(
    `UPDATE users SET
    email = $1,
    password = null,
    password_reset_token = null,
    first_name = '[Deleted User]',
    last_name = '[Deleted User]',
    referral_code = $1,
    referred_by = null,
    phone = null,
    mongo_id = null,
    other_signup_source = null,
    proxy_email = null
    WHERE id = $1`,
    [userId]
  )
}
