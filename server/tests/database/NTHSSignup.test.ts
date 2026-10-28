/**
 * @group database/parallel
 */

import { mocked } from 'jest-mock'
import { getClient } from '../../db'
import { getDbUlid, Ulid } from '../../models/pgUtils'
import * as UserCreationService from '../../services/UserCreationService'
import * as AuthService from '../../services/AuthService'
import { getIpWhoIs } from '../../services/IpAddressService'
import { createChapter } from './seed-utils'
import { getPhoneNumber } from '../mocks/generate'

jest.mock('../../services/MailService')
jest.mock('../../services/VolunteerService')
jest.mock('../../services/IpAddressService')

const client = getClient()

beforeAll(() => {
  mocked(getIpWhoIs).mockResolvedValue({ country_code: 'US' } as any)
})

const SIGNUP_PATHS = [
  ['SSO', UserCreationService.registerVolunteer],
  ['email', AuthService.registerVolunteer],
  [
    'partner',
    (data: any) =>
      AuthService.registerPartnerVolunteer({
        ...data,
        volunteerPartnerOrg: 'big-telecom',
      }),
  ],
] as const

async function signUpThrough(
  register: (data: any) => Promise<{ id: string }>,
  groupId: Ulid
) {
  // big-telecom, the seeded partner org, requires a mailtrap.com address.
  const email = `${getDbUlid().toLowerCase()}@mailtrap.com`
  const volunteer = await register({
    email,
    password: 'Password123!',
    firstName: 'Chapter',
    lastName: 'Invite',
    phone: getPhoneNumber(),
    terms: true,
    ip: '127.0.0.1',
    inviteCode: groupId.slice(-6),
  })
  const users = await client.query(`SELECT id FROM users WHERE email = $1`, [
    email,
  ])
  const memberships = await client.query(
    `SELECT 1 FROM nths_group_members WHERE user_id = $1 AND nths_group_id = $2`,
    [volunteer.id, groupId]
  )
  return { userRows: users.rows, membershipRows: memberships.rows }
}

describe.each(SIGNUP_PATHS)(
  '%s signup through a chapter invite',
  (_, register) => {
    test('creates the account and joins the chapter when it is open', async () => {
      const groupId = await createChapter(client)

      const { userRows, membershipRows } = await signUpThrough(
        register,
        groupId
      )

      expect(userRows).toHaveLength(1)
      expect(membershipRows).toHaveLength(1)
    })

    test('creates the account with no membership when the chapter has closed', async () => {
      const groupId = await createChapter(client, '2026-10-02T00:00:00.000Z')

      const { userRows, membershipRows } = await signUpThrough(
        register,
        groupId
      )

      expect(userRows).toHaveLength(1)
      expect(membershipRows).toHaveLength(0)
    })
  }
)
