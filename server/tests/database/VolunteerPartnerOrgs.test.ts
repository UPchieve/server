import { getClient } from '../../db'
import { getVolunteerPartnerOrgIdByKey } from '../../models/VolunteerPartnerOrg'

const client = getClient()

test('getVolunteerPartnerOrgIdByKey when VPO with key exists', async () => {
  const actual = await getVolunteerPartnerOrgIdByKey('big-telecom')
  expect(actual).toEqual('01859800-bc61-cd2d-b754-af08b7137d15')
})

test('getVolunteerPartnerOrgIdByKey when VPO with key does not exist', async () => {
  const actual = await getVolunteerPartnerOrgIdByKey('who-am-i')
  expect(actual).toBeUndefined()
})
