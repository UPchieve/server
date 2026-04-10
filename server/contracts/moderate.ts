import type { ModerationFailureReasons } from '../services/ModerationService/types'
import { ErrorResponse } from './shared'

export type ModerationResultPublic = boolean | ModerationFailureReasons

export type ModerateMessageResponse = {
  isClean: ModerationResultPublic
}

export type ModerateImageResultPublic = {
  isClean: boolean
  failures: string[]
}

export type ModerateImageResultResponse =
  | ModerateImageResultPublic
  | ErrorResponse
  | void
