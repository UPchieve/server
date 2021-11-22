import { InputError } from '../../models/Errors'
import { SponsorOrgManifest, sponsorOrgManifests } from '../../partnerManifests'

export function asSponsorOrg(sponsorOrg: string) {
  const sponsor: SponsorOrgManifest = sponsorOrgManifests[sponsorOrg]
  if (!sponsor) throw new InputError(`${sponsorOrg} is not a sponsor org`)

  return sponsor
}
