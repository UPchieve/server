import { getClient } from '../../db'
import { createUser, getUserIdByEmail } from '../../models/User'

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
