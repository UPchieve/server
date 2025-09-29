import { Uuid } from '../models/pgUtils'
import * as FeatureFlagService from './FeatureFlagService'

const FEATURES = ['imageUpload', 'screenshare', 'voiceChat'] as const
type FeatureName = (typeof FEATURES)[number]
type FeatureAccessDecision = { allow: boolean }
type FeatureAccessMap = Record<FeatureName, FeatureAccessDecision>
type DenyListPayload = FeatureName[] | undefined

export async function getFeatureAccess(
  userId: Uuid
): Promise<FeatureAccessMap> {
  const payload = (await FeatureFlagService.getFeatureAccessPolicyPayload(
    userId
  )) as DenyListPayload
  const denyList = Array.isArray(payload) ? payload : []

  const result = {} as FeatureAccessMap
  for (const name of FEATURES) {
    result[name] = { allow: !denyList.includes(name) }
  }
  return result
}
