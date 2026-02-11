export type ModerationType = 'contextual' | 'realtime_image'
export type GetModerationSettingResult = {
  name: string
  threshold: number
  penaltyWeight: number
}
