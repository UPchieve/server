import { Uuid } from '../models/pgUtils'
import { getLegacyUserObject } from '../models/User/legacy-user'
import * as FeatureFlagService from './FeatureFlagService'

const FEATURES = ['imageUpload', 'screenshare', 'voiceChat'] as const
type FeatureName = (typeof FEATURES)[number]

type FeatureAccessConfig = {
  enabled: boolean
  minSessions?: number
  requirePhoneVerified?: boolean
}

type FeatureAccessPolicy = {
  allFeaturesOff?: boolean
  features: Record<FeatureName, FeatureAccessConfig>
}

type UserSignals = {
  totalSessions: number
  phoneVerified: boolean
  // Not used today, but later we can derive this from the moderation_infractions table
  // (for example, we can block until N days after the latest infraction)
  blockedUntil?: string
}

const FEATURE_ACCESS_DENY_REASON = {
  ALL_FEATURES_OFF: 'ALL_FEATURES_OFF',
  BLOCKED_UNTIL: 'BLOCKED_UNTIL',
  DISABLED_FEATURE: 'DISABLED_FEATURE',
  REQUIRES_MIN_SESSIONS: 'REQUIRES_MIN_SESSIONS',
  REQUIRES_PHONE_VERIFICATION: 'REQUIRES_PHONE_VERIFICATION',
} as const
type FeatureAccessDenyReason =
  (typeof FEATURE_ACCESS_DENY_REASON)[keyof typeof FEATURE_ACCESS_DENY_REASON]

type FeatureAccessDecision = {
  allow: boolean
  reason?: FeatureAccessDenyReason
}

const DEFAULT_POLICY: FeatureAccessPolicy = {
  allFeaturesOff: false,
  features: {
    imageUpload: {
      enabled: true,
      minSessions: 0,
      requirePhoneVerified: false,
    },
    screenshare: { enabled: true, minSessions: 0, requirePhoneVerified: false },
    voiceChat: { enabled: true, minSessions: 0, requirePhoneVerified: false },
  },
}

function decideFeature(
  featureAccess: FeatureAccessConfig,
  signals: UserSignals
): FeatureAccessDecision {
  if (!featureAccess.enabled)
    return {
      allow: false,
      reason: FEATURE_ACCESS_DENY_REASON.DISABLED_FEATURE,
    }

  if (signals.blockedUntil && new Date(signals.blockedUntil) > new Date())
    return { allow: false, reason: FEATURE_ACCESS_DENY_REASON.BLOCKED_UNTIL }

  const minSessions = featureAccess.minSessions ?? 0
  const requiresPhoneVerification = featureAccess.requirePhoneVerified ?? false

  if (signals.totalSessions < minSessions)
    return {
      allow: false,
      reason: FEATURE_ACCESS_DENY_REASON.REQUIRES_MIN_SESSIONS,
    }
  if (requiresPhoneVerification && !signals.phoneVerified)
    return {
      allow: false,
      reason: FEATURE_ACCESS_DENY_REASON.REQUIRES_PHONE_VERIFICATION,
    }
  return { allow: true }
}

export function evaluateFeatureAccess(
  policy: FeatureAccessPolicy,
  signals: UserSignals
): Record<FeatureName, FeatureAccessDecision> {
  if (policy.allFeaturesOff) {
    return Object.fromEntries(
      FEATURES.map((name) => [
        name,
        { allow: false, reason: FEATURE_ACCESS_DENY_REASON.ALL_FEATURES_OFF },
      ])
    ) as Record<FeatureName, FeatureAccessDecision>
  }

  const result: Partial<Record<FeatureName, FeatureAccessDecision>> = {}
  for (const name of FEATURES) {
    result[name] = decideFeature(policy.features[name], signals)
  }
  return result as Record<FeatureName, FeatureAccessDecision>
}

export async function getFeatureAccessPolicy(
  userId: Uuid
): Promise<FeatureAccessPolicy> {
  const payload = (await FeatureFlagService.getFeatureAccessPolicyPayload(
    userId
  )) as FeatureAccessPolicy | null

  const policy: FeatureAccessPolicy = {
    allFeaturesOff: payload?.allFeaturesOff ?? DEFAULT_POLICY.allFeaturesOff,
    features: { ...DEFAULT_POLICY.features },
  }
  for (const name of FEATURES) {
    const src = payload?.features?.[name] ?? ({} as FeatureAccessConfig)
    const defaults = DEFAULT_POLICY.features[name]
    policy.features[name] = {
      enabled: src.enabled ?? defaults.enabled,
      minSessions: src.minSessions ?? defaults.minSessions,
      requirePhoneVerified:
        src.requirePhoneVerified ?? defaults.requirePhoneVerified,
    }
  }
  return policy
}

export async function getFeatureAccess(
  userId: Uuid
): Promise<Record<FeatureName, FeatureAccessDecision>> {
  const policy = await getFeatureAccessPolicy(userId)
  const user = await getLegacyUserObject(userId)
  const signals: UserSignals = {
    totalSessions: user.pastSessions.length,
    phoneVerified: user.phoneVerified,
  }

  return evaluateFeatureAccess(policy, signals)
}
