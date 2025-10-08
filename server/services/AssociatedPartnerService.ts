import config from '../config'
import { Ulid } from '../models/pgUtils'
import type { AssociatedPartner } from '../models/AssociatedPartner'
import * as Repo from '../models/AssociatedPartner'
import * as SponsorOrgRepo from '../models/SponsorOrg'

// This function assumes there is only a single volunteer org
// that can have priority for a partner student's request.
// In practice, this is probably true the vast majority of the time
// since there are only 2 priority orgs/sponsors total in prod,
// but technically a student could be "special" to both that org
// and the sponsor.
// TODO: Determine how much we care to actually fix that.
export async function getAssociatedPartner(
  studentPartnerOrg: string | undefined,
  studentSchoolId: Ulid | undefined
): Promise<AssociatedPartner | undefined> {
  // Determine if the student's partner org is one of the orgs that
  // should have priority matching with a partner volunteer org counterpart.
  if (
    studentPartnerOrg &&
    config.priorityMatchingPartnerOrgs.includes(studentPartnerOrg)
  ) {
    return Repo.getAssociatedPartnerByPartnerOrg(studentPartnerOrg)
  }

  const sponsorOrgs = await SponsorOrgRepo.getSponsorOrgs()
  for (const priorityOrg of config.priorityMatchingSponsorOrgs) {
    const matchingOrg = sponsorOrgs.find((org) => org.key === priorityOrg)

    // Determine if the student's school belongs to a sponsor org that
    // should have priority matching with a partner volunteer org counterpart.
    if (
      studentSchoolId &&
      matchingOrg &&
      matchingOrg.schoolIds?.length &&
      matchingOrg.schoolIds.includes(studentSchoolId)
    ) {
      return Repo.getAssociatedPartnerBySponsorOrg(priorityOrg)
    }

    // Determine if the student's partner org belongs to a sponsor org that
    // should have priority matching with a partner volunteer org counterpart.
    if (
      studentPartnerOrg &&
      matchingOrg &&
      matchingOrg.studentPartnerOrgKeys?.length &&
      matchingOrg.studentPartnerOrgKeys.includes(studentPartnerOrg)
    ) {
      return Repo.getAssociatedPartnerBySponsorOrg(priorityOrg)
    }
  }
}
