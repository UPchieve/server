import { isDisposableEmailDomain } from 'disposable-email-domains-js'
import { getEmailDomainBlocklistEntry } from '../models/EmailDomainBlocklist'

export async function isBlockedEmailDomain(email: string): Promise<boolean> {
  const domain = getEmailDomain(email)

  if (isDisposableEmailDomain(domain)) {
    return true
  }

  const result = await getEmailDomainBlocklistEntry(domain)
  return !!result
}

const DOMAIN_INDEX = 1
export function getEmailDomain(email: string): string {
  return email.split('@')[DOMAIN_INDEX].toLowerCase()
}
