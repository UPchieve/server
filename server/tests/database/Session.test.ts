/**
 * @group database
 */

import { setup, teardown } from '../postgres-test-hook'
import { IgetStudentContactInfoById } from '../../models/Student/queries'
import { Ulid } from 'id128'

jest.setTimeout(20 * 1000)
beforeAll(async () => {
  await setup()
})
afterAll(async () => {
  await teardown()
})

test('Make a connection', async () => {
  const result = await IgetStudentContactInfoById(Ulid.generate().toRaw())
  expect(result).toBeUndefined()
})
