import { FEATURE_FLAGS } from '../constants'
import { client as productClient } from '../product-client'
import { Ulid } from '../models/pgUtils'

async function isFeatureEnabled(featureFlagName: FEATURE_FLAGS, userId: Ulid) {
  return productClient.isFeatureEnabled(featureFlagName, userId)
}

export async function getFeatureFlagPayload(
  featureFlagName: FEATURE_FLAGS,
  userId: Ulid
) {
  return productClient.isFeatureEnabled(featureFlagName, userId)
}

export async function getAllFlagsForId(id: Ulid) {
  return productClient.getAllFlagsAndPayloads(id)
}

export function isChatBotEnabled() {
  // TODO: Either put this feature flag into PH, or remove
  // references from code.
  return false
}

export async function getStandardizedCertsFlag(userId: Ulid) {
  return await isFeatureEnabled(FEATURE_FLAGS.STANDARDIZED_CERTS, userId)
}

export async function getMutedSubjectAlertsFlag(userId: Ulid) {
  return await isFeatureEnabled(FEATURE_FLAGS.MUTED_SUBJECT_ALERTS, userId)
}

export async function getUsingOurPlatformFlag(userId: Ulid) {
  return await isFeatureEnabled(FEATURE_FLAGS.USING_OUR_PLATFORM, userId)
}

// The implicit return type expects a JSON shape, but this feature flag only
// has a string payload. We're making an explicit coercion from JSON to string
export async function getProcrastinationTextReminderCopy(
  userId: Ulid
): Promise<string | undefined> {
  return (await productClient.getFeatureFlagPayload(
    FEATURE_FLAGS.PROCRASTINATION_TEXT_REMINDER,
    userId
  )) as string
}

export async function getSessionRecapDmsFeatureFlag(userId: Ulid) {
  return isFeatureEnabled(FEATURE_FLAGS.SESSION_RECAP_DMS, userId)
}

export async function getWeeklySummaryAllHoursFlag(userId: Ulid) {
  return isFeatureEnabled(FEATURE_FLAGS.WEEKLY_SUMMARY_ALL_HOURS, userId)
}

export async function getRecapSocketUpdatesFeatureFlag(userId: Ulid) {
  return isFeatureEnabled(FEATURE_FLAGS.RECAP_SOCKET_UPDATES, userId)
}

export async function getSmsVerificationFeatureFlag(userId: Ulid) {
  return isFeatureEnabled(FEATURE_FLAGS.SMS_VERIFICATION, userId)
}

export async function getAllowDmsToPartnerStudentsFeatureFlag(userId: Ulid) {
  return isFeatureEnabled(FEATURE_FLAGS.ALLOW_DMS_TO_PARTNER_STUDENTS, userId)
}

export async function getProgressReportsFeatureFlag(userId: Ulid) {
  return await isFeatureEnabled(FEATURE_FLAGS.PROGRESS_REPORTS, userId)
}
