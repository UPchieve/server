import { getEmailDomainBlocklistEntry } from '../models/EmailDomainBlocklist'

const DOMAIN_INDEX = 1
export async function isBlockedEmailDomain(email: string): Promise<boolean> {
  const domain = email.split('@')[DOMAIN_INDEX]
  const result = await getEmailDomainBlocklistEntry(domain)
  return !!result
}
