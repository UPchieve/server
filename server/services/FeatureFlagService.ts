import { FEATURE_FLAGS } from '../constants'
import { client as productClient } from '../product-client'
import { Ulid } from '../models/pgUtils'
import { timeLimit } from '../utils/time-limit'

async function isFeatureEnabled(featureFlagName: FEATURE_FLAGS, userId: Ulid) {
  return await timeLimit({
    promise: productClient.isFeatureEnabled(featureFlagName, userId),
    waitInMs: 1000,
    resolveWith: false,
    timeReachedErrorMessage: `${featureFlagName} reached time limit of 1000`,
  })
}

export async function getFeatureFlagPayload(
  featureFlagName: FEATURE_FLAGS,
  userId: Ulid
) {
  return await timeLimit({
    promise: productClient.isFeatureEnabled(featureFlagName, userId),
    waitInMs: 1000,
    resolveWith: false,
    timeReachedErrorMessage: `${featureFlagName} reached time limit of 1000`,
  })
}

export async function getAllFlagsForId(id: Ulid) {
  return await timeLimit({
    promise: productClient.getAllFlagsAndPayloads(id),
    waitInMs: 1000,
    resolveWith: { featureFlags: {}, featureFlagPayloads: {} },
    timeReachedErrorMessage: `'getAllFlagsForId' reached time limit of 1000`,
  })
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
  return await timeLimit({
    promise: productClient.getFeatureFlagPayload(
      FEATURE_FLAGS.PROCRASTINATION_TEXT_REMINDER,
      userId
    ),
    waitInMs: 1000,
    resolveWith: undefined,
    timeReachedErrorMessage: `getFeatureFlagPayload reached time limit of 1000`,
  })
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

export async function getPaidTutorsPilotStudentEligibilityFeatureFlag(
  userId: Ulid
) {
  return await timeLimit({
    promise: productClient.getFeatureFlag(
      FEATURE_FLAGS.PAID_TUTORS_PILOT_STUDENT_ELIGIBILITY,
      userId,
      {
        personProperties: {
          paidTutorsPilotEligible: 'true',
        },
      }
    ),
    waitInMs: 1000,
    resolveWith: false,
    timeReachedErrorMessage: `getFeatureFlag for ${FEATURE_FLAGS.PAID_TUTORS_PILOT_STUDENT_ELIGIBILITY} reached time limit`,
  })
}
