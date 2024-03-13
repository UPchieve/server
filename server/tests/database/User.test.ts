import { getClient } from '../../db'
import {
  createUser,
  deleteUserPhoneInfo,
  getUserIdByEmail,
} from '../../models/User'
import faker from 'faker'

const client = getClient()

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
