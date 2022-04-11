import { wrapInsert, NameToId, getDbUlid } from '../../utils'
import * as pgQueries from './pg.queries'

export async function volunteerPartnerOrgsTest(): Promise<NameToId> {
  const orgs = [
    {
      id: getDbUlid(),
      key: 'big-telecom',
      name: 'Big Telecom',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'health-co',
      name: 'Health Co',
      receiveWeeklyHourSummaryEmail: false,
    },
  ]
  const temp: NameToId = {}
  for (const org of orgs) {
    temp[org.name] = await wrapInsert(
      'volunteer_partner_orgs',
      pgQueries.insertVolunteerPartnerOrg.run,
      { ...org }
    )
  }
  return temp
}
