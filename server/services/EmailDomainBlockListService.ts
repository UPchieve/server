import { getBlockedEmailDomainByDomain } from '../models/EmailDomainBlockList/queries'

export async function isEmailDomainBlocked(domain: string) {
  const result = await getBlockedEmailDomainByDomain(domain)
  return !!result
}
