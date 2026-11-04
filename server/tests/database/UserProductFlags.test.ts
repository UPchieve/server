/**
 * @group database/parallel
 */

import { getClient } from '../../db'
import { insertSingleRow } from '../db-utils'
import { buildUserRow } from '../mocks/generate'
import {
  createUPFByUserId,
  getUPFByUserId,
  setShareInfoModalDismissedAt,
} from '../../models/UserProductFlags/queries'

const client = getClient()

describe('setShareInfoModalDismissedAt', () => {
  test('records the dismissal for a user with product flags', async () => {
    const user = await insertSingleRow('users', buildUserRow(), client)
    await createUPFByUserId(user.id)

    const dismissedAt = await setShareInfoModalDismissedAt(user.id)

    const flags = await getUPFByUserId(user.id)
    expect(flags?.shareInfoModalDismissedAt).toEqual(dismissedAt)
  })

  test('creates the product flags row when the user has none', async () => {
    const user = await insertSingleRow('users', buildUserRow(), client)

    const dismissedAt = await setShareInfoModalDismissedAt(user.id)

    const flags = await getUPFByUserId(user.id)
    expect(flags?.shareInfoModalDismissedAt).toEqual(dismissedAt)
  })

  test('keeps the first dismissal time when dismissed again', async () => {
    const user = await insertSingleRow('users', buildUserRow(), client)
    await createUPFByUserId(user.id)

    const first = await setShareInfoModalDismissedAt(user.id)
    const second = await setShareInfoModalDismissedAt(user.id)

    expect(second).toEqual(first)
    const flags = await getUPFByUserId(user.id)
    expect(flags?.shareInfoModalDismissedAt).toEqual(first)
  })
})
