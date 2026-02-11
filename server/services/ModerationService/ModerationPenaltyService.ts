import { LiveMediaModerationCategories } from './types'
import logger from '../../logger'
import { ModerationSettingsResult } from '../../models/ModerationSettings/types'

export function weightModerationInfractions(
  infractions: LiveMediaModerationCategories[],
  moderationSettings: ModerationSettingsResult[]
): number {
  return infractions.reduce((acc, infraction) => {
    const penaltyWeight = getModerationPenaltyWeight(
      infraction,
      moderationSettings
    )
    return acc + penaltyWeight
  }, 0)
}

function getModerationPenaltyWeight(
  infraction: LiveMediaModerationCategories,
  moderationSettings: ModerationSettingsResult[]
) {
  const moderationSetting = moderationSettings.find(
    (moderationSetting) => moderationSetting.name === infraction
  )

  if (!moderationSetting) {
    logger.warn(
      { moderationReason: infraction },
      `Missing score for infraction category. Defaulting to severe score.`
    )
    return 10
  }

  return moderationSetting.penalty_weight
}
