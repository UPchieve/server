/**
 * @group database
 */

import { metaSetup } from '../postgres-test-hook'
import { IgetNextVolunteerToNotify } from '../../models/Volunteer/queries'

metaSetup()

test('Make a connection', async () => {
  const result = await IgetNextVolunteerToNotify('algebraOne', new Date())
  expect(result).toBeUndefined()
})
