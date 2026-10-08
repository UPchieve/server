import type {
  ModerationResultPublic,
  ModerateImageResultPublic,
} from '../contracts/moderate'
import { oldClientModerationResult } from '../services/ModerationService'
import {
  ModerationCategory,
  ModerationInfractionReasons,
} from '../services/ModerationService/types'

export function toModerationResultPublic(
  result: oldClientModerationResult | ModerationInfractionReasons
): ModerationResultPublic {
  return result
}

export function toModerateImageResultPublic(result: {
  isClean: boolean
  failures: ModerationCategory[]
}): ModerateImageResultPublic {
  return {
    isClean: result.isClean,
    failures: result.failures,
  }
}
