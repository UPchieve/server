import {
  AssociatedPartnerManifest,
  associatedPartnerManifests,
} from '../partnerManifests'

export function getAssociatedPartnerOrgByKey(
  key: keyof AssociatedPartnerManifest,
  value: string
): AssociatedPartnerManifest | undefined {
  for (const partnerKey of Object.keys(associatedPartnerManifests)) {
    if (associatedPartnerManifests[partnerKey][key] === value)
      return associatedPartnerManifests[partnerKey]
  }
  return undefined
}

export default getAssociatedPartnerOrgByKey
