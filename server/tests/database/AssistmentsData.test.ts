/**
 * @group database
 */

import { setup, teardown } from '../postgres-test-hook'
import { IgetAssistmentsDataBySession } from '../../models/AssistmentsData/queries'
import { Ulid } from 'id128'

/**
 * All database tests must mark @group database and use the setup/teadown hooks
 * in before/afterAll as shown below. These hooks spin up the pg container,
 * replace the app global pg pool client with one pointed to the test db, and
 * close the client and container on test completion.
 */
jest.setTimeout(20 * 1000) // use large timeout to accomodate containers + query network/run time
beforeAll(async () => {
  await setup()
}, 10 * 1000)
afterAll(async () => {
  await teardown()
})

test('Make a connection', async () => {
  const result = await IgetAssistmentsDataBySession(Ulid.generate().toRaw())
  expect(result).not.toBeDefined()
})
