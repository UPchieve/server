import type {
  ModerationResultPublic,
  ModerateImageResultPublic,
} from '../contracts/moderate'
import { oldClientModerationResult } from '../services/ModerationService'
import { ModerationFailureReasons } from '../services/ModerationService/types'

export function toModerationResultPublic(
  result: oldClientModerationResult | ModerationFailureReasons
): ModerationResultPublic {
  return result
}

export function toModerateImageResultPublic(result: {
  isClean: boolean
  failures: string[]
}): ModerateImageResultPublic {
  return {
    isClean: result.isClean,
    failures: result.failures,
  }
}
