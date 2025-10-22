/**
 * @group database/parallel
 */

import { faker } from '@faker-js/faker'
import { mocked } from 'jest-mock'
import { getClient } from '../../../db'
import { Ulid } from '../../../models/pgUtils'
import deidentifyUserJob from '../../../worker/jobs/deidentify-user'
import * as AwsService from '../../../services/AwsService'
import {
  createTestStudent,
  createTestUser,
  createTestVolunteer,
} from '../seed-utils'
import { Job } from 'bull'
import config from '../../../config'

jest.mock('../../../services/AwsService')
const mockAwsService = mocked(AwsService)

const client = getClient()

describe('deidentifyUserJob', () => {
  test('does not run for banned users with no force delete flag', async () => {
    const user = await createTestUser(client, {
      banType: 'complete',
    })

    await expect(deidentifyUserJob(createJob(user.id))).rejects.toThrow(
      `Failed to deidentify user: User ${user.id} is currently banned. Verify their sessions and media content before continuing with deletion.`
    )
  })

  test('runs for banned users if force delete flag is true', async () => {
    const user = await createTestUser(client, {
      banType: 'complete',
    })

    await expect(
      deidentifyUserJob(createJob(user.id, true))
    ).resolves.not.toThrow()

    const userAfter = await client.query(
      'SELECT * FROM upchieve.users WHERE id = $1',
      [user.id]
    )
    expect(userAfter.rows[0].first_name).toBe('[Deleted User]')
    expect(userAfter.rows[0].last_name).toBe('[Deleted User]')
    expect(userAfter.rows[0].email).toBe(user.id)
  })

  test('deletes volunteer photo id in external storage', async () => {
    const user = await createTestUser(client)
    const photoKey = 'test-photo-key'
    await createTestVolunteer(client, user.id, { photoIdS3Key: photoKey })

    await deidentifyUserJob(createJob(user.id))

    expect(mockAwsService.deleteObject).toHaveBeenCalledWith(
      config.awsS3.photoIdBucket,
      photoKey
    )
  })

  test('hard deletes records in admin_profiles', async () => {
    const user = await createTestUser(client)
    const userId = user.id

    await client.query(
      'INSERT INTO upchieve.admin_profiles (user_id) VALUES ($1)',
      [userId]
    )
    const adminProfilesBefore = await client.query(
      'SELECT * FROM upchieve.admin_profiles WHERE user_id = $1',
      [userId]
    )
    expect(adminProfilesBefore.rowCount).toBe(1)

    await deidentifyUserJob(createJob(userId))

    const adminProfilesAfter = await client.query(
      'SELECT * FROM upchieve.admin_profiles WHERE user_id = $1',
      [userId]
    )
    expect(adminProfilesAfter.rowCount).toBe(0)
  })

  test('hard deletes records in push_tokens', async () => {
    const user = await createTestUser(client)
    const userId = user.id

    await client.query(
      'INSERT INTO upchieve.push_tokens (id, user_id, token) VALUES (gen_random_uuid(), $1, $2), (gen_random_uuid(), $1, $3)',
      [userId, 'test-token', 'test-token2']
    )
    const pushTokensBefore = await client.query(
      'SELECT * FROM upchieve.push_tokens WHERE user_id = $1',
      [userId]
    )
    expect(pushTokensBefore.rowCount).toBe(2)

    await deidentifyUserJob(createJob(userId))

    const pushTokensAfter = await client.query(
      'SELECT * FROM upchieve.push_tokens WHERE user_id = $1',
      [userId]
    )
    expect(pushTokensAfter.rowCount).toBe(0)
  })

  test('hard deletes records in users_ip_addresses', async () => {
    const user = await createTestUser(client)
    const userId = user.id

    const ipIds = await client.query(`
        INSERT INTO upchieve.ip_addresses (ip) VALUES ('10.1.1.1'), ('10.1.1.2'), ('10.1.1.3') RETURNING id
      `)
    for (const { id } of ipIds.rows) {
      await client.query(
        `INSERT INTO upchieve.users_ip_addresses (id, ip_address_id, user_id)
        VALUES (gen_random_uuid(), $1, $2)
        `,
        [id, userId]
      )
    }
    const ipAddressesBefore = await client.query(
      'SELECT * FROM upchieve.users_ip_addresses WHERE user_id = $1',
      [userId]
    )
    expect(ipAddressesBefore.rowCount).toBe(3)

    await deidentifyUserJob(createJob(userId))

    const ipAddressesAfter = await client.query(
      'SELECT * FROM upchieve.users_ip_addresses WHERE user_id = $1',
      [userId]
    )
    expect(ipAddressesAfter.rows.length).toBe(0)
  })

  test('deidentifies rows in contact_form_submissions', async () => {
    const user = await createTestUser(client)
    const userId = user.id

    await client.query(
      `INSERT INTO upchieve.contact_form_submissions (id, user_id, user_email, message, topic)
      VALUES (gen_random_uuid(), $1, 'test@test.com', 'hi there i need halp', 'topic1'),
      (gen_random_uuid(), $1, 'meow@meow.ca', 'i changed my email', 'update account')`,
      [userId]
    )
    const submissionBefore = await client.query(
      'SELECT * FROM upchieve.contact_form_submissions WHERE user_id = $1',
      [userId]
    )
    expect(submissionBefore.rowCount).toBe(2)
    submissionBefore.rows.forEach((r) => {
      expect(r.user_email).toBeDefined()
    })

    await deidentifyUserJob(createJob(userId))

    const submissionAfter = await client.query(
      'SELECT * FROM upchieve.contact_form_submissions WHERE user_id = $1',
      [userId]
    )
    expect(submissionAfter.rowCount).toBe(2)
    submissionAfter.rows.forEach((r) => {
      expect(r.user_email).toBeNull()
    })
  })

  test('deidentifies rows in federated_credentials', async () => {
    const user = await createTestUser(client)
    const userId = user.id

    await client.query(
      `INSERT INTO upchieve.federated_credentials (id, issuer, user_id)
      VALUES ('1', 'google', $1),
      ('2', 'clever', $1),
      ('3', 'classlink', $1)`,
      [userId]
    )
    const fedCredBefore = await client.query(
      'SELECT * FROM upchieve.federated_credentials WHERE user_id = $1',
      [userId]
    )
    expect(fedCredBefore.rowCount).toBe(3)
    fedCredBefore.rows.forEach((r) => {
      expect(r.user_id).toBeDefined()
      expect(r.id).not.toBe(r.user_id)
    })

    await deidentifyUserJob(createJob(userId))

    const fedCredAfter = await client.query(
      'SELECT * FROM upchieve.federated_credentials WHERE user_id = $1',
      [userId]
    )
    expect(fedCredAfter.rowCount).toBe(3)
    fedCredAfter.rows.forEach((r) => {
      expect(r.user_id).toBeDefined()
      expect(r.id).toBe(r.user_id)
    })
  })

  test('deidentifies rows in ineligible_students', async () => {
    const email = faker.internet.email()
    const user = await createTestUser(client, { email })

    await client.query(
      `INSERT INTO upchieve.ineligible_students(id, email)
      VALUES (gen_random_uuid(), $1),
      (gen_random_uuid(), 'student1@ineligible.com'),
      (gen_random_uuid(), 'student2@ineligible.com'),
      (gen_random_uuid(), 'student3@ineligible.com')
      `,
      [email]
    )
    const ineligibleBefore = await client.query(
      'SELECT * FROM upchieve.ineligible_students WHERE email = $1',
      [email]
    )
    expect(ineligibleBefore.rowCount).toBe(1)
    expect(ineligibleBefore.rows[0].email).toBeDefined()

    await deidentifyUserJob(createJob(user.id))

    const ineligibleAfter = await client.query(
      'SELECT * FROM upchieve.ineligible_students WHERE email = $1',
      [email]
    )
    expect(ineligibleAfter.rowCount).toBe(0)
    const ineligibleAllAfter = await client.query(
      'SELECT * FROM upchieve.ineligible_students'
    )
    expect(ineligibleAllAfter.rowCount).toBe(4)
    const ineligibleEmptyAfter = await client.query(
      `SELECT * FROM upchieve.ineligible_students WHERE email = ''`
    )
    expect(ineligibleEmptyAfter.rowCount).toBe(1)
  })

  test('deidentifies rows in user_actions', async () => {
    const user = await createTestUser(client)
    const userId = user.id

    const ipIds = await client.query(`
        INSERT INTO upchieve.ip_addresses (ip) VALUES ('101.1.1.1'), ('101.1.1.2'), ('101.1.1.3') RETURNING id
      `)
    for (const { id } of ipIds.rows) {
      await client.query(
        `INSERT INTO upchieve.user_actions (user_id, ip_address_id, reference_email)
        VALUES ($1, $2, $3)
        `,
        [userId, id, faker.internet.email()]
      )
      await client.query(
        `INSERT INTO upchieve.user_actions (user_id, ip_address_id, reference_email)
        VALUES ($1, $2, $3)
        `,
        [userId, id, faker.internet.email()]
      )
    }
    const actionsBefore = await client.query(
      'SELECT * FROM upchieve.user_actions WHERE user_id = $1',
      [userId]
    )
    expect(actionsBefore.rowCount).toBe(6)
    actionsBefore.rows.forEach((r) => {
      expect(r.ip_address_id).toBeDefined()
      expect(r.reference_email).toBeDefined()
    })

    await deidentifyUserJob(createJob(userId))

    const actionsAfter = await client.query(
      `SELECT * FROM upchieve.user_actions WHERE user_id = $1 AND action IS DISTINCT FROM 'DELETED'`,
      [userId]
    )
    expect(actionsAfter.rowCount).toBe(6)
    actionsAfter.rows.forEach((r) => {
      expect(r.ip_address_id).toBeNull()
      expect(r.reference_email).toBeNull()
    })
  })

  test('deidentifies rows in volunteer_references', async () => {
    const user = await createTestUser(client)
    const userId = user.id

    await client.query(
      `INSERT INTO upchieve.volunteer_references (id, user_id, first_name, last_name, email, affiliation, relationship_length, rejection_reason, additional_info, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, 'we know each other from work', 'about 5 years', 'no rejection reason!', 'this person is great!', NOW(), NOW())
      `,
      [
        userId,
        faker.person.firstName(),
        faker.person.lastName(),
        faker.internet.email(),
      ]
    )
    await client.query(
      `INSERT INTO upchieve.volunteer_references (id, user_id, first_name, last_name, email, affiliation, relationship_length, rejection_reason, additional_info, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, 'best buds', 'my entire life', 'only because they are too good', 'cannot go wrong with them', NOW(), NOW())
      `,
      [
        userId,
        faker.person.firstName(),
        faker.person.lastName(),
        faker.internet.email(),
      ]
    )
    const referencesBefore = await client.query(
      'SELECT * FROM upchieve.volunteer_references'
    )
    expect(referencesBefore.rowCount).toBe(2)
    referencesBefore.rows.forEach((r) => {
      expect(r.first_name).toBeDefined()
      expect(r.last_name).toBeDefined()
      expect(r.email).toBeDefined()
      expect(r.affiliation).toBeDefined()
      expect(r.relationship_length).toBeDefined()
      expect(r.rejection_reason).toBeDefined()
      expect(r.additional_info).toBeDefined()
    })

    await deidentifyUserJob(createJob(userId))

    const referencesAfter = await client.query(
      'SELECT * FROM upchieve.volunteer_references'
    )
    expect(referencesAfter.rowCount).toBe(2)
    referencesAfter.rows.forEach((r) => {
      expect(r.first_name).toBe('')
      expect(r.last_name).toBe('')
      expect(r.email).toBe('')
      expect(r.affiliation).toBeNull()
      expect(r.relationship_length).toBeNull()
      expect(r.rejection_reason).toBeNull()
      expect(r.additional_info).toBeNull()
    })
  })

  test('deidentifies rows in parents_guardians if no other student referencing the pg', async () => {
    const user = await createTestStudent(client)
    const userId = user.user_id

    const pgResults = await client.query(
      `INSERT INTO parents_guardians (id, email) VALUES (gen_random_uuid(), 'pg@email.com') RETURNING id`
    )
    const pgId = pgResults.rows[0].id
    await client.query(
      `INSERT INTO upchieve.parents_guardians_students (students_id, parents_guardians_id)
        VALUES ($1, $2)
        `,
      [userId, pgId]
    )
    const pgBefore = await client.query(
      'SELECT * FROM upchieve.parents_guardians WHERE id = $1',
      [pgId]
    )
    expect(pgBefore.rowCount).toBe(1)
    expect(pgBefore.rows[0].email).toBe('pg@email.com')

    await deidentifyUserJob(createJob(userId))

    const pgAfter = await client.query(
      'SELECT * FROM upchieve.parents_guardians WHERE id = $1',
      [pgId]
    )
    expect(pgAfter.rowCount).toBe(1)
    expect(pgAfter.rows[0].email).toBe('')
  })

  test('does not deidentify rows in parents_guardians if other student referencing the pg', async () => {
    const user = await createTestStudent(client)
    const otherUser = await createTestStudent(client)
    const userId = user.user_id
    const otherUserId = otherUser.user_id

    const pgResults = await client.query(
      `INSERT INTO parents_guardians (id, email) VALUES (gen_random_uuid(), 'pg@email.com') RETURNING id`
    )
    const pgId = pgResults.rows[0].id
    await client.query(
      `INSERT INTO upchieve.parents_guardians_students (students_id, parents_guardians_id)
        VALUES ($1, $2)
        `,
      [userId, pgId]
    )
    await client.query(
      `INSERT INTO upchieve.parents_guardians_students (students_id, parents_guardians_id)
        VALUES ($1, $2)
        `,
      [otherUserId, pgId]
    )
    const pgBefore = await client.query(
      'SELECT * FROM upchieve.parents_guardians WHERE id = $1',
      [pgId]
    )
    expect(pgBefore.rowCount).toBe(1)
    expect(pgBefore.rows[0].email).toBe('pg@email.com')

    await deidentifyUserJob(createJob(userId))

    const pgAfter = await client.query(
      'SELECT * FROM upchieve.parents_guardians WHERE id = $1',
      [pgId]
    )
    expect(pgAfter.rowCount).toBe(1)
    expect(pgAfter.rows[0].email).toBe('pg@email.com')
  })

  test('deidentifies rows in student_profiles', async () => {
    const user = await createTestUser(client)
    const userId = user.id

    const schoolResults = await client.query(
      `INSERT INTO upchieve.schools (id, name, city_id) VALUES (gen_random_uuid(), 'Meow School', 1) RETURNING id`
    )
    const schoolId = schoolResults.rows[0].id
    const spoResults = await client.query(
      `INSERT INTO upchieve.student_partner_orgs (id, name, key) VALUES (gen_random_uuid(), 'Meow Partner Org', 'meow-key') RETURNING id`
    )
    const spoId = spoResults.rows[0].id
    const sposResults = await client.query(
      `INSERT INTO upchieve.student_partner_org_sites (id, name, student_partner_org_id) VALUES (gen_random_uuid(), 'Dayton', $1) RETURNING id`,
      [spoId]
    )
    const sposId = sposResults.rows[0].id
    await client.query(`INSERT INTO postal_codes (code) VALUES ('zip-12345')`)

    await client.query(
      `INSERT INTO upchieve.student_profiles (user_id, college, school_id, postal_code, student_partner_org_user_id, student_partner_org_id, student_partner_org_site_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        'NYU College',
        schoolId,
        'zip-12345',
        'unused-field',
        spoId,
        sposId,
      ]
    )

    const profileBefore = await client.query(
      'SELECT * FROM upchieve.student_profiles WHERE user_id = $1',
      [userId]
    )
    expect(profileBefore.rowCount).toBe(1)
    expect(profileBefore.rows[0].college).toBe('NYU College')
    expect(profileBefore.rows[0].school_id).toBe(schoolId)
    expect(profileBefore.rows[0].postal_code).toBe('zip-12345')
    expect(profileBefore.rows[0].student_partner_org_user_id).toBe(
      'unused-field'
    )
    expect(profileBefore.rows[0].student_partner_org_id).toBe(spoId)
    expect(profileBefore.rows[0].student_partner_org_site_id).toBe(sposId)

    await deidentifyUserJob(createJob(userId))

    const profileAfter = await client.query(
      'SELECT * FROM upchieve.student_profiles WHERE user_id = $1',
      [userId]
    )
    expect(profileAfter.rowCount).toBe(1)
    expect(profileAfter.rows[0].college).toBeNull()
    expect(profileAfter.rows[0].school_id).toBeNull()
    expect(profileAfter.rows[0].postal_code).toBeNull()
    expect(profileAfter.rows[0].student_partner_org_user_id).toBeNull()
    expect(profileAfter.rows[0].student_partner_org_id).toBeNull()
    expect(profileAfter.rows[0].student_partner_org_site_id).toBeNull()
  })

  test('deidentifies rows in volunteer_profiles', async () => {
    const user = await createTestUser(client)
    const userId = user.id

    const vpoResults = await client.query(
      `INSERT INTO upchieve.volunteer_partner_orgs (id, name, key) VALUES (gen_random_uuid(), 'Bark Volunteer Partner Org', 'bark') RETURNING id`
    )
    const vpoId = vpoResults.rows[0].id

    await client.query(
      `INSERT INTO upchieve.volunteer_profiles (user_id, volunteer_partner_org_id, timezone, photo_id_s3_key, linkedin_url, college, company, city, state, country)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        userId,
        vpoId,
        'America/New_York',
        'photo-key',
        'https://linkedin.com/bark',
        'Bark College',
        'Bark Company',
        'Winnipeg',
        'Manitoba',
        'Canada',
      ]
    )

    const profileBefore = await client.query(
      'SELECT * FROM upchieve.volunteer_profiles WHERE user_id = $1',
      [userId]
    )
    expect(profileBefore.rowCount).toBe(1)
    expect(profileBefore.rows[0].volunteer_partner_org_id).toBe(vpoId)
    expect(profileBefore.rows[0].timezone).toBe('America/New_York')
    expect(profileBefore.rows[0].photo_id_s3_key).toBe('photo-key')
    expect(profileBefore.rows[0].linkedin_url).toBe('https://linkedin.com/bark')
    expect(profileBefore.rows[0].college).toBe('Bark College')
    expect(profileBefore.rows[0].company).toBe('Bark Company')
    expect(profileBefore.rows[0].city).toBe('Winnipeg')
    expect(profileBefore.rows[0].state).toBe('Manitoba')
    expect(profileBefore.rows[0].country).toBe('Canada')

    await deidentifyUserJob(createJob(userId))

    const profileAfter = await client.query(
      'SELECT * FROM upchieve.volunteer_profiles WHERE user_id = $1',
      [userId]
    )
    expect(profileAfter.rowCount).toBe(1)
    expect(profileAfter.rows[0].volunteer_partner_org_id).toBeNull()
    expect(profileAfter.rows[0].timezone).toBeNull()
    expect(profileAfter.rows[0].photo_id_s3_key).toBeNull()
    expect(profileAfter.rows[0].linkedin_url).toBeNull()
    expect(profileAfter.rows[0].college).toBeNull()
    expect(profileAfter.rows[0].company).toBeNull()
    expect(profileAfter.rows[0].city).toBeNull()
    expect(profileAfter.rows[0].state).toBeNull()
    expect(profileAfter.rows[0].country).toBeNull()
  })

  test('deidentifies rows in teacher_profiles', async () => {
    const user = await createTestUser(client)
    const userId = user.id

    const schoolResults = await client.query(
      `INSERT INTO upchieve.schools (id, name, city_id) VALUES (gen_random_uuid(), 'Teacher School', 2) RETURNING id`
    )
    const schoolId = schoolResults.rows[0].id
    await client.query(
      `INSERT INTO upchieve.teacher_profiles (user_id, school_id, last_successful_clever_sync, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())`,
      [userId, schoolId, new Date()]
    )

    const profileBefore = await client.query(
      'SELECT * FROM upchieve.teacher_profiles WHERE user_id = $1',
      [userId]
    )
    expect(profileBefore.rowCount).toBe(1)
    expect(profileBefore.rows[0].school_id).toBe(schoolId)
    expect(profileBefore.rows[0].last_successful_clever_sync).toBeDefined()

    await deidentifyUserJob(createJob(userId))

    const profileAfter = await client.query(
      'SELECT * FROM upchieve.teacher_profiles WHERE user_id = $1',
      [userId]
    )
    expect(profileAfter.rowCount).toBe(1)
    expect(profileAfter.rows[0].school_id).toBeNull()
    expect(profileAfter.rows[0].last_successful_clever_sync).toBeNull()
  })

  test('deidentifies rows in users', async () => {
    const email = faker.internet.email()
    const user = await createTestUser(client, { email })
    const userId = user.id

    await client.query(
      `UPDATE upchieve.users SET
       password = 'p@$$w0rd!@#',
       password_reset_token = 'reset-token-123',
       phone = '+1234567890',
       mongo_id = 'mongo-id-123',
       other_signup_source = 'other-source',
       proxy_email = 'proxy@example.com'
       WHERE id = $1`,
      [userId]
    )

    const userBefore = await client.query(
      'SELECT * FROM upchieve.users WHERE id = $1',
      [userId]
    )
    expect(userBefore.rowCount).toBe(1)
    expect(userBefore.rows[0].first_name).not.toBe('[Deleted User]')
    expect(userBefore.rows[0].last_name).not.toBe('[Deleted User]')
    expect(userBefore.rows[0].email).toBe(email)
    expect(userBefore.rows[0].password).toBe('p@$$w0rd!@#')
    expect(userBefore.rows[0].password_reset_token).toBe('reset-token-123')
    expect(userBefore.rows[0].phone).toBe('+1234567890')
    expect(userBefore.rows[0].mongo_id).toBe('mongo-id-123')
    expect(userBefore.rows[0].other_signup_source).toBe('other-source')
    expect(userBefore.rows[0].proxy_email).toBe('proxy@example.com')
    expect(userBefore.rows[0].referral_code).toBeDefined()
    expect(userBefore.rows[0].referred_by).toBeNull()

    await deidentifyUserJob(createJob(userId))

    const userAfter = await client.query(
      'SELECT * FROM upchieve.users WHERE id = $1',
      [userId]
    )
    expect(userAfter.rowCount).toBe(1)
    expect(userAfter.rows[0].first_name).toBe('[Deleted User]')
    expect(userAfter.rows[0].last_name).toBe('[Deleted User]')
    expect(userAfter.rows[0].email).toBe(userId)
    expect(userAfter.rows[0].password).toBeNull()
    expect(userAfter.rows[0].password_reset_token).toBeNull()
    expect(userAfter.rows[0].phone).toBeNull()
    expect(userAfter.rows[0].mongo_id).toBeNull()
    expect(userAfter.rows[0].other_signup_source).toBeNull()
    expect(userAfter.rows[0].proxy_email).toBeNull()
    expect(userAfter.rows[0].referral_code).toBe(userId)
    expect(userAfter.rows[0].referred_by).toBeNull()
  })

  test('adds DELETED user_action', async () => {
    const user = await createTestUser(client)
    const userId = user.id

    const deleteActionBefore = await client.query(
      `
        SELECT * FROM user_actions WHERE action = 'DELETED' AND user_id = $1
      `,
      [userId]
    )
    expect(deleteActionBefore.rowCount).toBe(0)

    await deidentifyUserJob(createJob(userId))

    const deleteActionAfter = await client.query(
      `
        SELECT * FROM user_actions WHERE action = 'DELETED' AND user_id = $1
      `,
      [userId]
    )
    expect(deleteActionAfter.rowCount).toBe(1)
    expect(deleteActionAfter.rows[0].action_type).toBe('ACCOUNT')
  })

  test('deidentifies the referrals when user is the referrer', async () => {
    const user = await createTestUser(client)
    const userId = user.id

    const referred1 = await createTestUser(client)
    const referred2 = await createTestUser(client)

    await client.query(
      'INSERT INTO upchieve.referrals (referred_by, user_id) VALUES ($1, $2), ($1, $3)',
      [userId, referred1.id, referred2.id]
    )

    const referralsBefore = await client.query(
      'SELECT * FROM upchieve.referrals WHERE referred_by = $1 AND user_id IN ($2, $3)',
      [userId, referred1.id, referred2.id]
    )
    expect(referralsBefore.rowCount).toBe(2)
    referralsBefore.rows.forEach((r) => {
      expect(r.referred_by).toBe(userId)
      expect(r.user_id).toBeDefined()
    })

    await deidentifyUserJob(createJob(userId))

    const referredUsersAfter = await client.query(
      'SELECT * FROM upchieve.referrals WHERE user_id IN ($1, $2)',
      [referred1.id, referred2.id]
    )
    expect(referredUsersAfter.rowCount).toBe(2)
    referredUsersAfter.rows.forEach((r) => {
      expect(r.referred_by).toBeNull()
    })

    const usersReferralsAfter = await client.query(
      'SELECT * FROM upchieve.referrals WHERE referred_by = $1',
      [userId]
    )
    expect(usersReferralsAfter.rowCount).toBe(2)
    usersReferralsAfter.rows.forEach((r) => {
      expect(r.user_id).toBeNull()
    })
  })

  test('deidentifies the referrals when user was referred', async () => {
    const user = await createTestUser(client)
    const userId = user.id

    const referredBy = await createTestUser(client)
    const referredById = referredBy.id

    await client.query(
      'INSERT INTO upchieve.referrals (user_id, referred_by) VALUES ($1, $2)',
      [userId, referredById]
    )

    const referralsBefore = await client.query(
      'SELECT * FROM upchieve.referrals WHERE user_id = $1',
      [userId]
    )
    expect(referralsBefore.rowCount).toBe(1)
    expect(referralsBefore.rows[0].user_id).toBe(userId)
    expect(referralsBefore.rows[0].referred_by).toBe(referredById)

    await deidentifyUserJob(createJob(referredById))

    const userReferralAfter = await client.query(
      'SELECT * FROM upchieve.referrals WHERE user_id = $1',
      [userId]
    )
    expect(userReferralAfter.rowCount).toBe(1)
    expect(userReferralAfter.rows[0].referred_by).toBeNull()

    const referredByAfter = await client.query(
      'SELECT * FROM upchieve.referrals WHERE referred_by = $1',
      [referredById]
    )
    expect(referredByAfter.rowCount).toBe(1)
    expect(referredByAfter.rows[0].user_id).toBeNull()
  })

  test('deidentifies the users_student_partner_orgs_instances when the student is part of partner orgs', async () => {
    const user = await createTestUser(client)
    const userId = user.id

    const schoolId = (
      await client.query(
        `INSERT INTO upchieve.schools (id, name, city_id) VALUES (gen_random_uuid(), 'Partner School', 2) RETURNING id`
      )
    ).rows[0].id
    const schoolSpoId = (
      await client.query(
        `INSERT INTO upchieve.student_partner_orgs (id, name, key, school_id, created_at) VALUES (gen_random_uuid(), 'School Partner Org', 'school-partner', $1, '2022-05-09T00:00:00Z') RETURNING id`,
        [schoolId]
      )
    ).rows[0].id
    const spoId = (
      await client.query(
        `INSERT INTO upchieve.student_partner_orgs (id, name, key, created_at) VALUES (gen_random_uuid(), 'Partner Org', 'partner', '2022-05-09T00:00:00Z') RETURNING id`
      )
    ).rows[0].id
    const createdAt = new Date('2024-06-15T10:30:00Z')
    const deactivatedAt = new Date('2025-07-20T15:45:00Z')
    await client.query(
      `INSERT INTO upchieve.users_student_partner_orgs_instances
      (user_id, student_partner_org_id, created_at, deactivated_on)
      VALUES ($1, $2, $3, NULL), ($1, $5, $3, $4)`,
      [userId, schoolSpoId, createdAt, deactivatedAt, spoId]
    )

    const instancesBefore = await client.query(
      'SELECT * FROM upchieve.users_student_partner_orgs_instances WHERE user_id = $1',
      [userId]
    )
    const dummySchoolOrgId = (
      await client.query(
        `SELECT id FROM student_partner_orgs WHERE key = 'dummy-school-org'`
      )
    ).rows[0].id
    const dummyOrgId = (
      await client.query(
        `SELECT id FROM student_partner_orgs WHERE key = 'dummy-org'`
      )
    ).rows[0].id
    expect(instancesBefore.rowCount).toBe(2)
    instancesBefore.rows.forEach((r) => {
      expect(r.student_partner_org_id).not.toBe(dummySchoolOrgId)
      expect(r.student_partner_org_id).not.toBe(dummyOrgId)
    })

    await deidentifyUserJob(createJob(userId))

    const studentInstancesAfter = await client.query(
      'SELECT * FROM upchieve.users_student_partner_orgs_instances WHERE user_id = $1',
      [userId]
    )
    expect(studentInstancesAfter.rowCount).toBe(2)
    const dummySchoolInstanceAfter = studentInstancesAfter.rows.find(
      (r) => r.student_partner_org_id === dummySchoolOrgId
    )
    expect(dummySchoolInstanceAfter).toBeDefined()
    expect(dummySchoolInstanceAfter.created_at).toEqual(createdAt)
    expect(dummySchoolInstanceAfter.deactivated_on).toBeNull()
    const dummyInstanceAfter = studentInstancesAfter.rows.find(
      (r) => r.student_partner_org_id === dummyOrgId
    )
    expect(dummyInstanceAfter).toBeDefined()
    expect(dummyInstanceAfter.created_at).toEqual(createdAt)
    expect(dummyInstanceAfter.deactivated_on).toEqual(deactivatedAt)

    const orgInstancesAfter = await client.query(
      `
        SELECT * FROM upchieve.users_student_partner_orgs_instances WHERE student_partner_org_id IN ($1, $2) AND user_id IS NULL
      `,
      [schoolSpoId, spoId]
    )
    expect(orgInstancesAfter.rowCount).toBe(2)
    const MONDAY_DAY = 1
    const schoolOrgInstanceAfter = orgInstancesAfter.rows.find(
      (r) => r.student_partner_org_id === schoolSpoId
    )
    expect(new Date(schoolOrgInstanceAfter.created_at).getDay()).toBe(
      MONDAY_DAY
    )
    expect(schoolOrgInstanceAfter.deactivated_on).toBeNull()
    // 2024-06-15 is a Saturday, so start of ISO week is 2024-06-10.
    expect(new Date(schoolOrgInstanceAfter.created_at).toISOString()).toBe(
      '2024-06-10T00:00:00.000Z'
    )

    const orgInstanceAfter = orgInstancesAfter.rows.find(
      (r) => r.student_partner_org_id === spoId
    )
    expect(new Date(orgInstanceAfter.created_at).getDay()).toBe(MONDAY_DAY)
    expect(new Date(orgInstanceAfter.deactivated_on).getDay()).toBe(MONDAY_DAY)
    // 2024-06-15 is a Saturday, so start of ISO week is 2024-06-10
    expect(new Date(orgInstanceAfter.created_at).toISOString()).toBe(
      '2024-06-10T00:00:00.000Z'
    )
    // 2025-07-20 is a Sunday, so start of ISO week is 2025-07-14
    expect(new Date(orgInstanceAfter.deactivated_on).toISOString()).toBe(
      '2025-07-14T00:00:00.000Z'
    )
  })

  test('deidentifies the users_volunteer_partner_orgs_instances when the volunteer is part of a partner org', async () => {
    const user = await createTestUser(client)
    const userId = user.id

    const vpoResults = await client.query(
      `INSERT INTO upchieve.volunteer_partner_orgs (id, name, key, created_at) VALUES (gen_random_uuid(), 'Volunteer Partner Org', 'volunteer-partner', '2022-05-09T00:00:00Z') RETURNING id`
    )
    const vpoId = vpoResults.rows[0].id
    const createdAt = new Date('2023-08-10T14:20:00Z')
    const deactivatedAt = new Date('2023-09-05T09:15:00Z')
    await client.query(
      `INSERT INTO upchieve.users_volunteer_partner_orgs_instances (user_id, volunteer_partner_org_id, created_at, deactivated_on) VALUES ($1, $2, $3, $4)`,
      [userId, vpoId, createdAt, deactivatedAt]
    )

    const instancesBefore = await client.query(
      'SELECT * FROM upchieve.users_volunteer_partner_orgs_instances WHERE user_id = $1',
      [userId]
    )
    expect(instancesBefore.rowCount).toBe(1)
    expect(instancesBefore.rows[0].user_id).toBe(userId)
    expect(instancesBefore.rows[0].volunteer_partner_org_id).toBe(vpoId)
    expect(instancesBefore.rows[0].created_at).toEqual(createdAt)
    expect(instancesBefore.rows[0].deactivated_on).toEqual(deactivatedAt)

    await deidentifyUserJob(createJob(userId))

    const instancesAfter = await client.query(
      'SELECT * FROM upchieve.users_volunteer_partner_orgs_instances WHERE user_id = $1',
      [userId]
    )
    const dummyVpoId = (
      await client.query(
        `SELECT id FROM volunteer_partner_orgs WHERE key = 'dummy-org'`
      )
    ).rows[0].id
    expect(instancesAfter.rowCount).toBe(1)
    expect(instancesAfter.rows[0].volunteer_partner_org_id).toBe(dummyVpoId)
    expect(instancesAfter.rows[0].created_at).toEqual(createdAt)
    expect(instancesAfter.rows[0].deactivated_on).toEqual(deactivatedAt)

    const orgInstanceAfter = await client.query(
      'SELECT * FROM upchieve.users_volunteer_partner_orgs_instances WHERE user_id IS NULL AND volunteer_partner_org_id = $1',
      [vpoId]
    )
    expect(orgInstanceAfter.rowCount).toBe(1)
    const MONDAY_DAY = 1
    expect(new Date(orgInstanceAfter.rows[0].created_at).getDay()).toBe(
      MONDAY_DAY
    )
    expect(new Date(orgInstanceAfter.rows[0].deactivated_on).getDay()).toBe(
      MONDAY_DAY
    )
    // 2023-08-10 is a Thursday, so start of ISO week is 2023-08-07
    expect(new Date(orgInstanceAfter.rows[0].created_at).toISOString()).toBe(
      '2023-08-07T00:00:00.000Z'
    )
    // 2023-09-05 is a Tuesday, so start of ISO week is 2023-09-04
    expect(
      new Date(orgInstanceAfter.rows[0].deactivated_on).toISOString()
    ).toBe('2023-09-04T00:00:00.000Z')
  })
})

function createJob(userId: Ulid, forceDelete = false) {
  return { data: { userId, forceDelete } } as Job
}
