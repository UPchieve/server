/**
 * @group database
 */

import { ONE_MINUTE, setup, teardown } from '../postgres-test-hook'
import { IgetStudentContactInfoById } from '../../models/Student/queries'
import { Ulid } from 'id128'

jest.setTimeout(2 * ONE_MINUTE)
beforeAll(async () => {
  await setup()
}, ONE_MINUTE)
afterAll(async () => {
  await teardown()
}, ONE_MINUTE)

test('Make a connection', async () => {
  const result = await IgetStudentContactInfoById(Ulid.generate().toRaw())
  expect(result).toBeUndefined()
})
