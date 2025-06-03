/**
 * @group database/parallel
 */

import { faker } from '@faker-js/faker'
import { getClient } from '../../db'
import {
  banUserById,
  countReferredUsers,
  createUser,
  CreateUserPayload,
  deleteUserPhoneInfo,
  upsertUser,
  UserContactInfo,
} from '../../models/User'
import {
  SESSION_REPORT_REASON,
  USER_BAN_REASONS,
  USER_BAN_TYPES,
} from '../../constants'
import { reportSession } from '../../services/SessionService'
import {
  buildSessionRow,
  buildStudentPartnerOrg,
  buildStudentPartnerOrgUpchieveInstance,
  buildStudentProfile,
  buildUserRow,
  buildUserRole,
} from '../mocks/generate'
import { insertSingleRow } from '../db-utils'
import { adminUpdateUser, getUserContactInfo } from '../../services/UserService'
import { getDbUlid } from '../../models/pgUtils'
import { getLegacyUser } from '../../models/User/pg.queries'

const client = getClient()
jest.mock('../../services/MailService')

test('createUser', async () => {
  const user = {
    email: 'test@test.com',
    firstName: 'Test',
    lastName: 'McTest',
    password: 'Pass123',
    referralCode: faker.string.uuid(),
  }

  await createUser(user, client)

  const actual = await client.query('SELECT * FROM users WHERE email = $1', [
    user.email,
  ])
  expect(actual.rows.length).toBe(1)
})

test('deleteUserPhoneInfo', async () => {
  const user = {
    email: faker.internet.email().toLowerCase(),
    firstName: 'Test',
    lastName: 'McTest',
    phone: faker.phone.number(),
    phoneVerified: true,
    password: 'Pass123',
  }
  await createUser(user, client)
  await client.query(`UPDATE users SET sms_consent = true WHERE email = $1`, [
    user.email,
  ])
  var getUserResult = await client.query(
    'SELECT * FROM users WHERE email = $1',
    [user.email]
  )
  expect(getUserResult.rows[0]).toEqual(
    expect.objectContaining({
      email: user.email,
      phone: user.phone,
      phone_verified: user.phoneVerified,
      sms_consent: true,
    })
  )
  await deleteUserPhoneInfo(getUserResult.rows[0].id)
  getUserResult = await client.query('SELECT * FROM users WHERE email = $1', [
    user.email,
  ])
  expect(getUserResult.rows[0]).toEqual(
    expect.objectContaining({
      email: user.email,
      phone: null,
      phone_verified: false,
      sms_consent: false,
    })
  )
})

describe('getLegacyUser', () => {
  const BROOKLYN_CITY_ID = 2
  const nonPartnerSchool = {
    id: getDbUlid(),
    name: 'Non Partner School',
    isPartner: false,
    cityId: BROOKLYN_CITY_ID,
  }
  const partnerSchool = {
    id: getDbUlid(),
    name: 'Partner School',
    isPartner: false,
    cityId: BROOKLYN_CITY_ID,
  }
  const partnerSchoolWithNoInstances = {
    id: getDbUlid(),
    name: 'Partner School With No Instances',
    isPartner: false,
    cityId: BROOKLYN_CITY_ID,
  }
  const partnerSchoolSpoId = getDbUlid() as string
  const partnerSchoolWithNoInstancesSpoId = getDbUlid() as string

  beforeAll(async () => {
    await client.query(
      'REFRESH MATERIALIZED VIEW upchieve.current_grade_levels_mview'
    )

    // Insert schools
    const insertSchoolSql =
      'INSERT INTO upchieve.schools (id, name, partner, city_id) VALUES ($1, $2, $3, $4)'
    await client.query(insertSchoolSql, [
      nonPartnerSchool.id,
      nonPartnerSchool.name,
      nonPartnerSchool.isPartner,
      nonPartnerSchool.cityId,
    ])
    await client.query(insertSchoolSql, [
      partnerSchool.id,
      partnerSchool.name,
      partnerSchool.isPartner,
      partnerSchool.cityId,
    ])
    await client.query(insertSchoolSql, [
      partnerSchoolWithNoInstances.id,
      partnerSchoolWithNoInstances.name,
      partnerSchoolWithNoInstances.isPartner,
      partnerSchoolWithNoInstances.cityId,
    ])

    // Insert their related student_partner_orgs
    await insertSingleRow(
      'upchieve.student_partner_orgs',
      buildStudentPartnerOrg({
        id: partnerSchoolSpoId,
        key: 'partner school spo',
        name: 'partner school spo',
        signupCode: 'PS SPO',
        schoolId: partnerSchool.id,
      }),
      client
    )
    await insertSingleRow(
      'upchieve.student_partner_orgs',
      buildStudentPartnerOrg({
        id: partnerSchoolWithNoInstancesSpoId,
        key: 'partner school spo 2',
        name: 'partner school spo 2',
        signupCode: 'PS SPO 2',
        schoolId: partnerSchoolWithNoInstances.id,
      }),
      client
    )
  })

  const saveUserToDb = async () => {
    const payload: CreateUserPayload = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
    }
    return createUser(payload, client)
  }

  const testIsSchoolPartner = async (
    userId: string,
    isSchoolPartner: boolean
  ) => {
    const legacyUser = await getLegacyUser.run({ userId }, client)
    expect(legacyUser.length).toEqual(1)
    expect((legacyUser[0] as any).is_school_partner).toEqual(isSchoolPartner)
  }

  it('gives is_school_partner=false when the schools not an SPO', async () => {
    const user = await saveUserToDb()
    await insertSingleRow(
      'student_profiles',
      buildStudentProfile({
        userId: user.id,
        schoolId: nonPartnerSchool.id,
      }),
      client
    )
    await testIsSchoolPartner(user.id, false)
  })

  it('gives is_school_partner=true when the school is an SPO but has no instances', async () => {
    const user = await saveUserToDb()
    await insertSingleRow(
      'student_profiles',
      buildStudentProfile({
        userId: user.id,
        schoolId: partnerSchoolWithNoInstances.id,
      }),
      client
    )
    await testIsSchoolPartner(user.id, true)
  })

  it('gives is_school_partner=false when the school SPO instance is deactivated', async () => {
    const user = await saveUserToDb()
    await insertSingleRow(
      'student_profiles',
      buildStudentProfile({
        userId: user.id,
        schoolId: partnerSchool.id,
      }),
      client
    )
    await insertSingleRow(
      'student_partner_orgs_upchieve_instances',
      buildStudentPartnerOrgUpchieveInstance({
        studentPartnerOrgId: partnerSchoolSpoId,
        deactivatedOn: new Date(),
      }),
      client
    )
    await testIsSchoolPartner(user.id, false)
  })

  it('gives is_school_partner=true when there exists some school SPO instance with deactivated_on=null', async () => {
    const user = await saveUserToDb()
    await insertSingleRow(
      'student_profiles',
      buildStudentProfile({
        userId: user.id,
        schoolId: partnerSchool.id,
      }),
      client
    )
    await insertSingleRow(
      'student_partner_orgs_upchieve_instances',
      buildStudentPartnerOrgUpchieveInstance({
        studentPartnerOrgId: partnerSchoolSpoId,
        deactivatedOn: new Date(),
      }),
      client
    )
    await insertSingleRow(
      'student_partner_orgs_upchieve_instances',
      buildStudentPartnerOrgUpchieveInstance({
        studentPartnerOrgId: partnerSchoolSpoId,
        deactivatedOn: null,
      }),
      client
    )
    await insertSingleRow(
      'student_partner_orgs_upchieve_instances',
      buildStudentPartnerOrgUpchieveInstance({
        studentPartnerOrgId: partnerSchoolSpoId,
        deactivatedOn: new Date(),
      }),
      client
    )

    await testIsSchoolPartner(user.id, true)

    // Now deactivate the partner
    await client.query(
      'UPDATE upchieve.student_partner_orgs_upchieve_instances SET deactivated_on = NOW() where student_partner_org_id = $1',
      [partnerSchoolSpoId]
    )
    await testIsSchoolPartner(user.id, false)

    // Now activate the partner again
    await client.query(
      'INSERT INTO upchieve.student_partner_orgs_upchieve_instances (id, student_partner_org_id, deactivated_on) VALUES ($1, $2, $3)',
      [getDbUlid(), partnerSchoolSpoId, null]
    )
    await testIsSchoolPartner(user.id, true)
  })
})

describe('upsertUser', () => {
  test('creates the user if did not exist', async () => {
    const user = {
      email: 'create@upsert.com',
      firstName: 'Create',
      lastName: 'Upsert',
      password: 'Pass123',
      referralCode: faker.string.uuid(),
    }

    const before = await client.query('SELECT * FROM users WHERE email = $1', [
      user.email,
    ])
    expect(before.rows.length).toBe(0)

    const returned = await upsertUser(user, client)
    expect(returned.isCreated).toBe(true)

    const after = await client.query('SELECT * FROM users WHERE email = $1', [
      user.email,
    ])
    expect(after.rows.length).toBe(1)
  })

  test('updates the user if did exist', async () => {
    const user = {
      email: 'update@upsert.com',
      firstName: 'Update',
      lastName: 'Upsert',
      password: 'Pass123',
      phone: '1111111111',
    }
    await createUser(user, client)
    const before = await client.query('SELECT * FROM users WHERE email = $1', [
      user.email,
    ])
    expect(before.rows.length).toBe(1)

    const updatedUser = {
      ...user,
      firstName: 'New First Name',
      lastName: 'New Last Name',
      password: '123Pass',
      phone: '9999999999',
    }

    const returned = await upsertUser(updatedUser, client)
    expect(returned.isCreated).toBe(false)

    const after = await client.query('SELECT * FROM users WHERE email = $1', [
      user.email,
    ])
    expect(after.rows.length).toBe(1)
    expect(after.rows[0].first_name).toBe(updatedUser.firstName)
    expect(after.rows[0].last_name).toBe(updatedUser.lastName)
    expect(after.rows[0].password).toBe(updatedUser.password)
    expect(after.rows[0].phone).toBe(updatedUser.phone)
  })
})

describe('admin update user', () => {
  test('change ban type to complete when updating user from admin', async () => {
    const student = {
      email: 'adminupdate@ban.com',
      firstName: 'Ban',
      lastName: 'Complete',
      password: 'Pass123',
      phone: '1111111113',
    }
    await createUser(student, client)
    const studentId = (
      await client.query('SELECT id FROM upchieve.users WHERE email = $1', [
        student.email,
      ])
    ).rows[0].id
    await insertSingleRow(
      'users_roles',
      buildUserRole(studentId, 'student'),
      client
    )

    const before = await client.query(
      'SELECT * FROM upchieve.users WHERE email = $1',
      [student.email]
    )

    expect(before.rows[0].ban_type).toBe(null)
    const data = {
      userId: before.rows[0].id,
      banType: USER_BAN_TYPES.COMPLETE,
      email: before.rows[0].email,
      isVerified: true,
      isBanned: false,
      isDeactivated: false,
      inGatesStudy: false,
      isVolunteer: false,
    }

    await client.query(
      'INSERT INTO user_product_flags (user_id, created_at, updated_at) VALUES ($1, NOW(), NOW())',
      [data.userId]
    )

    await adminUpdateUser(data)

    const after = await client.query(
      'SELECT * FROM upchieve.users WHERE email = $1',
      [student.email]
    )

    expect(after.rows[0].ban_type).toBe(USER_BAN_TYPES.COMPLETE)
  })
})

describe('ban type users tests', () => {
  test('bans user by id with a complete ban type', async () => {
    const user = {
      email: 'bantype@complete.com',
      firstName: 'Ban',
      lastName: 'Complete',
      password: 'Pass123',
      phone: '1111111111',
    }
    await createUser(user, client)
    const before = await client.query('SELECT * FROM users WHERE email = $1', [
      user.email,
    ])
    expect(before.rows[0].ban_type).toBe(null)

    await banUserById(
      before.rows[0].id,
      USER_BAN_TYPES.COMPLETE,
      USER_BAN_REASONS.SESSION_REPORTED
    )
    const after = await client.query('SELECT * FROM users WHERE email = $1', [
      user.email,
    ])
    expect(after.rows[0].ban_type).toBe(USER_BAN_TYPES.COMPLETE)
  })

  test('bans user by id when reporting a session', async () => {
    const volunteer = {
      email: 'volunteer@bantype.com',
      firstName: 'Volunteer',
      lastName: 'Test',
      password: 'Pass123',
      phone: '1111111111',
    }
    await createUser(volunteer, client)
    const upsertedVolunteerId = (
      await client.query('SELECT id FROM upchieve.users WHERE email = $1', [
        volunteer.email,
      ])
    ).rows[0].id
    await insertSingleRow(
      'users_roles',
      buildUserRole(upsertedVolunteerId, 'volunteer'),
      client
    )

    const student = {
      email: 'studentban@complete.com',
      firstName: 'Ban',
      lastName: 'Complete',
      password: 'Pass123',
      phone: '1111111112',
    }
    await createUser(student, client)
    const before = await client.query(
      'SELECT * FROM upchieve.users WHERE email = $1',
      [student.email]
    )
    expect(before.rows[0].ban_type).toBe(null)

    const session = await insertSingleRow(
      'sessions',
      await buildSessionRow(
        {
          studentId: before.rows[0].id,
          volunteerId: upsertedVolunteerId,
        },
        client
      ),
      client
    )

    const sessionId = session.id
    const reportReason = SESSION_REPORT_REASON.STUDENT_RUDE
    const reportMessage = 'User was rude'
    const source = 'recap'

    const upsertedVolunteerContactInfo = (await getUserContactInfo(
      upsertedVolunteerId
    )) as UserContactInfo

    await reportSession(
      { ...upsertedVolunteerContactInfo, isVolunteer: true },
      {
        sessionId,
        reportReason,
        reportMessage,
        source,
      }
    )

    const after = await client.query(
      'SELECT * FROM upchieve.users WHERE email = $1',
      [student.email]
    )

    expect(after.rows[0].ban_type).toBe(USER_BAN_TYPES.COMPLETE)
  })
})

test('countReferredUsers', async () => {
  const referralCodes = [
    faker.string.uuid(),
    faker.string.uuid(),
    faker.string.uuid(),
  ]
  const referrer = await insertSingleRow(
    'users',
    buildUserRow({
      phoneVerified: true,
      emailVerified: true,
      referralCode: referralCodes[0],
    }),
    client
  )
  // Initial state
  let actual = await countReferredUsers(referrer.id)
  expect(actual).toEqual(0)

  // Volunteer
  const referredUser1 = await insertSingleRow(
    'users',
    buildUserRow({
      referredBy: referrer.id,
      phoneVerified: false,
      emailVerified: false,
      referralCode: referralCodes[1],
    }),
    client
  )
  await insertSingleRow(
    'users_roles',
    buildUserRole(referredUser1.id, 'volunteer'),
    client
  )
  // Student and volunteer
  const referredUser2 = await insertSingleRow(
    'users',
    buildUserRow({
      referredBy: referrer.id,
      phoneVerified: false,
      emailVerified: true,
      referralCode: referralCodes[2],
    }),
    client
  )
  await insertSingleRow(
    'users_roles',
    buildUserRole(referredUser2.id, 'student'),
    client
  )
  await insertSingleRow(
    'users_roles',
    buildUserRole(referredUser2.id, 'volunteer'),
    client
  )
  actual = await countReferredUsers(referrer.id)
  expect(actual).toEqual(2)

  // Now test the filters
  const onlyStudents = await countReferredUsers(referrer.id, {
    withRoles: ['student'],
  })
  const onlyStudentVolunteers = await countReferredUsers(referrer.id, {
    withRoles: ['student', 'volunteer'],
  })
  const onlyVolunteers = await countReferredUsers(referrer.id, {
    withRoles: ['volunteer'],
  })

  const onlyVerified = await countReferredUsers(referrer.id, {
    withPhoneOrEmailVerifiedAs: true,
  })
  const onlyVerifiedVolunteers = await countReferredUsers(referrer.id, {
    withPhoneOrEmailVerifiedAs: true,
    withRoles: ['volunteer'],
  })

  expect(onlyStudents).toEqual(1)
  expect(onlyStudentVolunteers).toEqual(1)
  expect(onlyVolunteers).toEqual(2)

  expect(onlyVerified).toEqual(1)
  expect(onlyVerifiedVolunteers).toEqual(1)
})
