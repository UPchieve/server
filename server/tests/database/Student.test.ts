/**
 * @group database
 */

import { metaSetup } from '../postgres-test-hook'
import { getStudentContactInfoById } from '../../models/Student/queries'
import { Ulid } from 'id128'

metaSetup()

test('Make a connection', async () => {
  const result = await getStudentContactInfoById(Ulid.generate().toRaw())
  expect(result).toBeUndefined()
})
