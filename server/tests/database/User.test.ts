/**
 * @group database
 */

import { metaSetup } from '../postgres-test-hook'
import { getUserIdByEmail } from '../../models/User'

metaSetup()

test('Make a connection', async () => {
  const result = await getUserIdByEmail('student@upchieve.org')
  expect(result).toBeUndefined()
})
