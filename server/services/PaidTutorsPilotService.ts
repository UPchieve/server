import { SUBJECT_TYPES } from '../constants'
import { Ulid } from '../models/pgUtils'
import { getPaidTutorsPilotStudentEligibilityFeatureFlag } from './FeatureFlagService'
import {
  getUPFByUserId,
  updatePaidTutorsPilotGroup,
} from '../models/UserProductFlags'
import { identify } from './AnalyticsService'

export async function bucketFor(userId: Ulid) {
  const results = await getUPFByUserId(userId)
  return results?.paidTutorsPilotGroup
}

const eligibleSubjects = [SUBJECT_TYPES.MATH, SUBJECT_TYPES.COLLEGE]

export async function bucketUser(userId: Ulid, topic: SUBJECT_TYPES) {
  const existingGroup = await bucketFor(userId)

  if (existingGroup) {
    return existingGroup
  } else if (eligibleSubjects.includes(topic)) {
    // Let posthog decide whether this user is in test or control
    // https://posthog.com/docs/libraries/node#advanced-overriding-server-properties
    const group = await getPaidTutorsPilotStudentEligibilityFeatureFlag(userId)
    if (group === 'test' || group === 'control') {
      identify(userId, { paidTutorsPilotGroup: group })
      await updatePaidTutorsPilotGroup(userId, group)
    }
    return group
  }
}
