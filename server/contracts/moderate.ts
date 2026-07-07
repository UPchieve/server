import type {
  ModerationCategory,
  ModerationInfractionReasons,
} from '../services/ModerationService/types'
import { ErrorResponse } from './shared'

export type ModerationResultPublic = boolean | ModerationInfractionReasons

export type ModerateMessageResponse = {
  isClean: ModerationResultPublic
}

export type ModerateImageResultPublic = {
  isClean: boolean
  failures: ModerationCategory[]
}

export type ModerateImageResultResponse =
  | ModerateImageResultPublic
  | ErrorResponse
  | void
