export type ModerationType = 'contextual' | 'realtime_image'
export type ModerationSettingResult = {
  name: string
  threshold: number
  penaltyWeight: number
}

export type GetModerationSettingResult = Record<string, ModerationSettingResult>
