import faker from 'faker'
import { getClient } from '../../db'
import {
  banUserById,
  createUser,
  deleteUserPhoneInfo,
  getUserIdByEmail,
  upsertUser,
} from '../../models/User'
import {
  SESSION_REPORT_REASON,
  USER_BAN_REASONS,
  USER_BAN_TYPES,
} from '../../constants'
import { reportSession } from '../../services/SessionService'
import { buildSessionRow } from '../mocks/generate'
import { insertSingleRow } from '../db-utils'
import { adminUpdateUser } from '../../services/UserService'

const client = getClient()
jest.mock('../../services/MailService')

test('Make a connection', async () => {
  const result = await getUserIdByEmail('student@upchieve.org')
  expect(result).toBeUndefined()
})

test('createUser', async () => {
  const user = {
    email: 'test@test.com',
    firstName: 'Test',
    lastName: 'McTest',
    password: 'Pass123',
    referralCode: '999',
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
    phone: faker.phone.phoneNumber('+###########'),
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

describe('upsertUser', () => {
  test('creates the user if did not exist', async () => {
    const user = {
      email: 'create@upsert.com',
      firstName: 'Create',
      lastName: 'Upsert',
      password: 'Pass123',
      referralCode: '999',
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
    const upsertedVolunteer = await client.query(
      'SELECT * FROM upchieve.users WHERE email = $1',
      [volunteer.email]
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
          volunteerId: upsertedVolunteer.rows[0].id,
        },
        client
      ),
      client
    )

    const sessionId = session.id
    const reportReason = SESSION_REPORT_REASON.STUDENT_RUDE
    const reportMessage = 'User was rude'
    const source = 'recap'

    await reportSession(
      { ...upsertedVolunteer.rows[0], isVolunteer: true },
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
