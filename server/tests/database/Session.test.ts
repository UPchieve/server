/**
 * @group database
 */

import { metaSetup } from '../postgres-test-hook'
import { IgetStudentContactInfoById } from '../../models/Student/queries'
import { Ulid } from 'id128'

metaSetup()

test('Make a connection', async () => {
  const result = await IgetStudentContactInfoById(Ulid.generate().toRaw())
  expect(result).toBeUndefined()
})
