import { wrapInsert, NameToId, getDbUlid } from '../../utils'
import * as pgQueries from './pg.queries'

export async function requiredEmailDomainsTest(
  vpoIds: NameToId
): Promise<NameToId> {
  const domains = [
    {
      id: getDbUlid(),
      domain: 'mailtrap.com',
      volunteerPartnerOrgId: vpoIds['Big Telecom'] as string,
    },
  ]
  const temp: NameToId = {}
  for (const domain of domains) {
    temp[domain.domain] = await wrapInsert(
      'required_email_domains',
      pgQueries.insertRequiredEmailDomain.run,
      { ...domain }
    )
  }
  return temp
}
