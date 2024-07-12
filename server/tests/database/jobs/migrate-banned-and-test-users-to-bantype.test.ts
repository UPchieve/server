import faker from 'faker'
import { getDbUlid } from '../../../../database/seeds/utils'
import { getClient } from '../../../db'
import { migrateUsers } from '../../../scripts/migrate-banned-and-test-users-to-bantype'

const client = getClient()

describe('migrateBannedAndTestUsersToBanType', () => {
  test('banned users have a ban type of complete', async () => {
    const bannedUser = await createUser(true, false, faker.internet.email())
    expect(bannedUser.banned).toBeTruthy()
    expect(bannedUser.ban_type).toEqual(null)

    await migrateUsers(client)

    const userCompleteBan = await getUser(bannedUser.id)
    expect(userCompleteBan.banned).toBeTruthy()
    expect(userCompleteBan.ban_type).toBe('complete')
  })

  test('test users without an upchieve email have ban type of shadow', async () => {
    const testUser = await createUser(false, true, faker.internet.email())
    expect(testUser.test_user).toBeTruthy()
    expect(testUser.ban_type).toEqual(null)

    await migrateUsers(client)

    const userShadowBan = await getUser(testUser.id)
    expect(userShadowBan.test_user).toBeFalsy()
    expect(userShadowBan.ban_type).toBe('shadow')
  })

  test('test users with upchieve email keep ban type of null', async () => {
    const testUser = await createUser(false, true, 'test@upchieve.org')
    expect(testUser.test_user).toBeTruthy()
    expect(testUser.ban_type).toEqual(null)

    await migrateUsers(client)

    const userBanType = await getUser(testUser.id)
    expect(userBanType.test_user).toBeTruthy()
    expect(userBanType.ban_type).toEqual(null)
  })

  test('users that are not banned or test users keep ban type of null', async () => {
    const testUser = await createUser(false, false, faker.internet.email())
    expect(testUser.test_user).toBeFalsy()
    expect(testUser.banned).toBeFalsy()
    expect(testUser.ban_type).toEqual(null)

    await migrateUsers(client)

    const user = await getUser(testUser.id)
    expect(user.test_user).toBeFalsy()
    expect(user.banned).toBeFalsy()
    expect(user.ban_type).toEqual(null)
  })
})

async function createUser(
  isBanned: boolean,
  isTestUser: boolean,
  email: string
) {
  const testUser = await client.query(
    `
    INSERT INTO users (id, first_name, last_name, email, test_user, banned, referral_code)
    VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, banned, test_user, ban_type;
    `,
    [
      getDbUlid(),
      faker.name.firstName(),
      faker.name.lastName(),
      email,
      isTestUser,
      isBanned,
      faker.random.alphaNumeric(6),
    ]
  )

  return testUser.rows[0]
}

async function getUser(userId: string) {
  const user = await client.query(
    `
    SELECT banned, test_user, ban_type FROM users WHERE id = $1
    `,
    [userId]
  )

  return user.rows[0]
}
