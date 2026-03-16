import { LiveMediaModerationCategories } from './types'
import logger from '../../logger'
import { GetModerationSettingResult } from '../../models/ModerationSettings/types'
import config from '../../config'

export function weightModerationInfractions(
  infractions: LiveMediaModerationCategories[],
  moderationSettings: GetModerationSettingResult
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
  moderationSettings: GetModerationSettingResult
) {
  const moderationSetting = moderationSettings[infraction]

  if (!moderationSetting) {
    logger.warn(
      { moderationReason: infraction },
      `Missing score for infraction category. Defaulting to severe score.`
    )

    return config.liveMediaBanInfractionScoreThreshold ?? 10
  }

  return moderationSetting.penaltyWeight
}
