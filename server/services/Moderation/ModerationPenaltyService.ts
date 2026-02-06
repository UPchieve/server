export enum LiveMediaModerationCategories {
  PROFANITY = 'profanity',
  VIOLENCE = 'violence',
  LINK = 'link',
  ADDRESS = 'address',
  EMAIL = 'email',
  PHONE = 'phone',
  HIGH_TOXICITY = 'high toxicity',
  SWIM_WEAR = 'swimwear or underwear',
  EXPLICIT = 'explicit',
  NON_EXPLICIT = 'non-explicit nudity of intimate parts and kissing',
  DISTURBING = 'visually disturbing',
  DRUGS = 'drugs & tobacco',
  ALCOHOL = 'alcohol',
  RUDE_GESTURES = 'rude gestures',
  GAMBLING = 'gambling',
  HATE_SYMBOLS = 'hate symbols',
  PERSON_IN_IMAGE = 'person detected in image',
}

export function weighSessionInfractions(reasons: string[]): number {
  return reasons.reduce((acc, current) => {
    const categoryScore = getScoreForCategory(current)
    return acc + categoryScore
  }, 0)
}

/**
 * This gets the score/weight for the severity of the moderation infraction.
 * We have a configurable threshold for the max score you can accrue before being
 * live media-banned - see {@link config.liveMediaBanInfractionScoreThreshold}
 * @param category
 */
export function getScoreForCategory(
  category: LiveMediaModerationCategories | string
): number {
  let categoryScore
  switch (category.toLowerCase()) {
    case LiveMediaModerationCategories.PROFANITY:
    case LiveMediaModerationCategories.HIGH_TOXICITY:
    case LiveMediaModerationCategories.DRUGS:
    case LiveMediaModerationCategories.ALCOHOL:
    case LiveMediaModerationCategories.RUDE_GESTURES:
    case LiveMediaModerationCategories.GAMBLING:
      categoryScore = 1
      break
    case LiveMediaModerationCategories.VIOLENCE:
    case LiveMediaModerationCategories.SWIM_WEAR:
    case LiveMediaModerationCategories.EXPLICIT:
    case LiveMediaModerationCategories.NON_EXPLICIT:
    case LiveMediaModerationCategories.HATE_SYMBOLS:
    case LiveMediaModerationCategories.DISTURBING:
      categoryScore = 10
      break
    case LiveMediaModerationCategories.LINK:
    case LiveMediaModerationCategories.EMAIL:
    case LiveMediaModerationCategories.PHONE:
    case LiveMediaModerationCategories.ADDRESS:
      categoryScore = 4
      break
    default:
      logger.error(
        `Missing score for infraction category ${category}. Defaulting to severe score.`
      )
      categoryScore = 10
  }

  return categoryScore
}
