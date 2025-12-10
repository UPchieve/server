import { FEATURE_FLAGS } from '../constants'
import { client as productClient } from '../product-client'
import { Ulid, Uuid } from '../models/pgUtils'
import { timeLimit } from '../utils/time-limit'
import * as AnalyticsService from './AnalyticsService'

async function isFeatureEnabled(
  featureFlagName: FEATURE_FLAGS,
  userId: Ulid,
  waitInMs?: number
): Promise<boolean | undefined> {
  return await timeLimit({
    promise: productClient.isFeatureEnabled(featureFlagName, userId),
    fallbackReturnValue: false,
    timeLimitReachedErrorMessage: `Posthog: 'isFeatureEnabled' did not receive response for feature flag '${featureFlagName}'.`,
    waitInMs,
  })
}

export async function getFeatureFlagPayload(
  featureFlagName: FEATURE_FLAGS,
  userId: Ulid,
  waitInMs?: number
) {
  return await timeLimit({
    promise: productClient.getFeatureFlagPayload(featureFlagName, userId),
    fallbackReturnValue: false,
    timeLimitReachedErrorMessage: `Posthog: 'getFeatureFlagPayload' did not receive response for feature flag '${featureFlagName}'.`,
    waitInMs,
  })
}

export async function getAllFlagsForId(
  id: Ulid,
  personProperties: AnalyticsService.AnalyticPersonProperties,
  waitInMs?: number
) {
  return await timeLimit({
    promise: productClient.getAllFlagsAndPayloads(id, {
      // PostHog has the wrong type for this. It should be similar to their JS SDK
      // where the type should be Record<string, any>
      // https://github.com/PostHog/posthog-js-lite/issues/194
      // @ts-expect-error
      personProperties,
    }),
    fallbackReturnValue: {
      featureFlags: {},
      featureFlagPayloads: {},
    },
    timeLimitReachedErrorMessage: `Posthog: 'getAllFlagsForId' did not receive response.`,
    waitInMs,
  })
}

export async function getUsingOurPlatformFlag(userId: Ulid) {
  return await isFeatureEnabled(FEATURE_FLAGS.USING_OUR_PLATFORM, userId)
}

export async function getAllowDmsToPartnerStudentsFeatureFlag(userId: Ulid) {
  return isFeatureEnabled(FEATURE_FLAGS.ALLOW_DMS_TO_PARTNER_STUDENTS, userId)
}

export async function getProgressReportsFeatureFlag(userId: Ulid) {
  return await isFeatureEnabled(
    FEATURE_FLAGS.PROGRESS_REPORTS,
    userId,
    1000 * 5
  )
}

export enum AI_MODERATION_STATE {
  disabled = 'disabled',
  targeted = 'targeted',
  notTargeted = 'notTargeted',
}
export async function getAiModerationFeatureFlag(
  userId: Ulid
): Promise<keyof typeof AI_MODERATION_STATE> {
  return timeLimit({
    promise: new Promise(async (r) => {
      const result = await productClient.getFeatureFlag(
        FEATURE_FLAGS.AI_MODERATION,
        userId
      )
      if (result === 'targeted') {
        r(AI_MODERATION_STATE.targeted)
      } else if (result === 'notTargeted') {
        r(AI_MODERATION_STATE.notTargeted)
      } else {
        r(AI_MODERATION_STATE.disabled)
      }
    }),
    fallbackReturnValue: AI_MODERATION_STATE.disabled,
    timeLimitReachedErrorMessage: `Posthog: 'getAllFlagsForId' did not receive response.`,
    waitInMs: 2000,
  })
}

export async function getCollegeListWorkSheetFlag(userId: Ulid) {
  return await isFeatureEnabled(FEATURE_FLAGS.COLLEGE_LIST_WORKSHEET, userId)
}

export type FallIncentiveFlagPayload = {
  incentiveStartDate: Date
  maxQualifiedSessionsPerUser: number
  maxQualifiedSessionsPerWeek?: number
}

export async function getFallIncentiveProgramPayload(
  userId: Ulid
): Promise<FallIncentiveFlagPayload | null> {
  const payload = await getFeatureFlagPayload(
    FEATURE_FLAGS.FALL_INCENTIVE_PROGRAM,
    userId
  )
  if (!payload) return null
  if (!payload.maxQualifiedSessionsPerWeek)
    payload.maxQualifiedSessionsPerWeek = 1
  return {
    incentiveStartDate: new Date(payload.incentiveStartDate),
    maxQualifiedSessionsPerWeek: payload.maxQualifiedSessionsPerWeek,
    maxQualifiedSessionsPerUser: payload.maxQualifiedSessionsPerUser,
  }
}

export async function getTeacherGettingStartedAssignmentFlag(userId: Uuid) {
  return await isFeatureEnabled(
    FEATURE_FLAGS.TEACHER_GETTING_STARTED_ASSIGNMENT,
    userId
  )
}

export async function getGenerateSessionSummaryFeatureFlag(userId: Uuid) {
  return await isFeatureEnabled(FEATURE_FLAGS.GENERATE_SESSION_SUMMARY, userId)
}

export async function getSessionSummaryFeatureFlag(userId: Uuid) {
  return await isFeatureEnabled(FEATURE_FLAGS.GET_SESSION_SUMMARY, userId)
}

export async function getDisplayVolunteerLanguagesFlag(userId: Uuid) {
  return await isFeatureEnabled(
    FEATURE_FLAGS.DISPLAY_VOLUNTEER_LANGUAGES,
    userId
  )
}

export async function getSendAmbassadorOpportunityEmailFeatureFlag(
  userId: Uuid
) {
  return await isFeatureEnabled(
    FEATURE_FLAGS.SEND_AMBASSADOR_OPPORTUNITY_EMAIL,
    userId,
    5 * 1000
  )
}

export async function getSendPositiveStudentFeedbackEmailFeatureFlag(
  userId: Uuid
) {
  return await isFeatureEnabled(
    FEATURE_FLAGS.SEND_POSITIVE_STUDENT_FEEDBACK_EMAIL,
    userId,
    5 * 1000
  )
}

export async function getStudentsInitiateDmsFeatureFlag(userId: Ulid) {
  return await isFeatureEnabled(FEATURE_FLAGS.STUDENTS_INITIATE_DMS, userId)
}

export async function getStudentCreationDisabledFeatureFlag(userId: Ulid) {
  return await isFeatureEnabled(FEATURE_FLAGS.DISABLE_STUDENT_CREATION, userId)
}

export async function getNotifyTutorFlag(userId: Ulid) {
  return isFeatureEnabled(FEATURE_FLAGS.NOTIFY_TUTOR, userId)
}

export async function isZwibserveEnabled(userId: Ulid) {
  return isFeatureEnabled(FEATURE_FLAGS.ZWIBSERVE, userId)
}
