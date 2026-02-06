export type ModerationSettingsType = 'contextual' | 'realtime_image'
export type ModerationSettingsResult = {
  name: string
  threshold: number
  penalty_weight: number
}
