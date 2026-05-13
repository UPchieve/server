/**
 * @group database/parallel
 */

import { getClient } from '../../../db'
import backfillReferralsTable from '../../../scripts/backfill-referrals-table'
import { createTestUser } from '../seed-utils'

const client = getClient()

describe('backfillReferralsTable', () => {
  beforeEach(async () => {
    await client.query('DELETE FROM upchieve.referrals')
    await client.query('UPDATE upchieve.users SET referred_by = null')
  })

  test('backfills referrals table from users.referred_by', async () => {
    const referredBy = await createTestUser(client)

    const referred1 = await createTestUser(client, {
      referredById: referredBy.id,
    })
    const referred2 = await createTestUser(client, {
      referredById: referredBy.id,
    })
    const notReferred = await createTestUser(client)

    const beforeReferrals = await client.query(
      'SELECT * FROM upchieve.referrals'
    )
    expect(beforeReferrals.rows.length).toBe(0)

    await backfillReferralsTable()

    const afterReferrals = await client.query(
      'SELECT * FROM upchieve.referrals;'
    )
    expect(afterReferrals.rows.length).toBe(2)

    const referral1 = afterReferrals.rows.find(
      (r) => r.user_id === referred1.id
    )
    expect(referral1).toBeDefined()
    expect(referral1.referred_by).toBe(referredBy.id)
    expect(referral1.user_id).toBe(referred1.id)

    const referral2 = afterReferrals.rows.find(
      (r) => r.user_id === referred2.id
    )
    expect(referral2).toBeDefined()
    expect(referral2.referred_by).toBe(referredBy.id)
    expect(referral2.user_id).toBe(referred2.id)

    const noReferral = afterReferrals.rows.find(
      (r) => r.user_id === notReferred.id
    )
    expect(noReferral).toBeUndefined()

    const referrer = afterReferrals.rows.find(
      (r) => r.user_id === referredBy.id
    )
    expect(referrer).toBeUndefined()
  })

  test('handles duplicate runs safely', async () => {
    const referrer = await createTestUser(client)
    const referred = await createTestUser(client, { referredById: referrer.id })

    await backfillReferralsTable()
    await backfillReferralsTable()

    const referrals = await client.query('SELECT * FROM upchieve.referrals')
    expect(referrals.rows.length).toBe(1)

    expect(referrals.rows[0].user_id).toBe(referred.id)
    expect(referrals.rows[0].referred_by).toBe(referrer.id)
  })

  test('preserves existing referrals table data', async () => {
    const referrer = await createTestUser(client)
    await createTestUser(client, { referredById: referrer.id })

    const existingUser = await createTestUser(client)
    await client.query(
      'INSERT INTO upchieve.referrals (user_id, referred_by) VALUES ($1, $2);',
      [existingUser.id, referrer.id]
    )

    const beforeReferrals = await client.query(
      'SELECT * FROM upchieve.referrals;'
    )
    expect(beforeReferrals.rows.length).toBe(1)

    await backfillReferralsTable()

    const afterReferrals = await client.query(
      'SELECT * FROM upchieve.referrals;'
    )
    expect(afterReferrals.rows.length).toBe(2)
  })
})
