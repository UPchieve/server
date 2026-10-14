export type ModerationType = 'contextual' | 'realtime_image' | 'image_upload'
export type ModerationSettingResult = {
  name: string
  threshold: number
  penaltyWeight: number
}

export type GetModerationSettingResult = Record<string, ModerationSettingResult>
