/**
 * @group database
 */

import { metaSetup } from '../postgres-test-hook'
import { IgetUserIdByEmail } from '../../models/User/queries'

metaSetup()

test('Make a connection', async () => {
  const result = await IgetUserIdByEmail('student@upchieve.org')
  expect(result).toBeUndefined()
})
