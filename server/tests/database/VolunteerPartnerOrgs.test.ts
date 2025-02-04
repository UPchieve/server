/**
 * @group database/parallel
 */

import { getVolunteerPartnerOrgIdByKey } from '../../models/VolunteerPartnerOrg'

test('getVolunteerPartnerOrgIdByKey when VPO with key exists', async () => {
  const actual = await getVolunteerPartnerOrgIdByKey('big-telecom')
  expect(actual).toEqual('01919662-87f7-ecae-08ec-2d9b6c13ba3c')
})

test('getVolunteerPartnerOrgIdByKey when VPO with key does not exist', async () => {
  const actual = await getVolunteerPartnerOrgIdByKey('who-am-i')
  expect(actual).toBeUndefined()
})
