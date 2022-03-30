import { wrapInsert, NameToId, getDbUlid } from '../utils'
import * as pgQueries from './pg.queries'

export async function volunteerPartnerOrgsReal(): Promise<NameToId> {
  const orgs = [
    {
      id: getDbUlid(),
      key: 'example',
      name: 'UPchieve',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'atlassian',
      name: 'Atlassian',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'verizon',
      name: 'Verizon',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'pwc',
      name: 'PWC',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'queens-library',
      name: 'Queens Public Library',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'mizuho',
      name: 'Mizuho',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'goldman-sachs',
      name: 'Goldman Sachs',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'att',
      name: 'AT&T',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'cigna',
      name: 'Cigna',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'fox',
      name: 'Fox',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'loomis-sayles',
      name: 'Loomis Sayles',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'twilio',
      name: 'Twilio',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'santander',
      name: 'Santander',
      receiveWeeklyHourSummaryEmail: false,
    },
    {
      id: getDbUlid(),
      key: 'dell',
      name: 'Dell',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'newrelic',
      name: 'New Relic',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'synopsys',
      name: 'Synopsys',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'farmers',
      name: 'Farmers Insurance',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'nvidia',
      name: 'NVIDIA',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'boston-scientific',
      name: 'Boson Scientific',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'somos',
      name: 'SOMOS',
      receiveWeeklyHourSummaryEmail: true,
    },
    {
      id: getDbUlid(),
      key: 'nhs-brookline',
      name: 'NHS at Hollis Brookline High School',
      receiveWeeklyHourSummaryEmail: true,
    }

  ]
  const temp: NameToId = {}
  for (const org of orgs) {
    temp[org.key] = await wrapInsert(
      'volunteer_partner_orgs',
      pgQueries.insertVolunteerPartnerOrg.run,
      { ...org }
    )
  }
  return temp
}
