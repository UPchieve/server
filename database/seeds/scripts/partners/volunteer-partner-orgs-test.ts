import { wrapInsert, NameToId, getDbUlid } from '../utils'
import * as pgQueries from './pg.queries'

export async function volunteerPartnerOrgsTest(): Promise<NameToId> {
  const orgs = [
    {
      id: getDbUlid(),
      key: 'placeholder1',
      name: 'Placeholder 1',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'placeholder2',
      name: 'Placeholder 2',
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
