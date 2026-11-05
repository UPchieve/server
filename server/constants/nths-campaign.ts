export const NTHS_CAMPAIGN_EMAILS = [
  'setupDay3',
  'recruitingDay3',
  'recruitingDay8',
  'recruitingDay14',
  'recruitingDay18',
  'activationA1',
  'activationA2',
  'activationA3',
  'day21Extension',
] as const

export type NTHSCampaignEmail = (typeof NTHS_CAMPAIGN_EMAILS)[number]

type FirstName = {
  firstName: string
}

type LaunchDate = {
  launch_date: string
}

type DaysLeft = {
  days_left: number
}

type ActivationProgress = {
  members_count: number
  tutoring_count: number
}

export type NTHSCampaignMergeFieldsByEmail = {
  setupDay3: FirstName
  recruitingDay3: FirstName & LaunchDate
  recruitingDay8: FirstName & DaysLeft
  recruitingDay14: FirstName & DaysLeft
  recruitingDay18: FirstName &
    DaysLeft & {
      invite_link: string
    }
  activationA1: FirstName & LaunchDate & ActivationProgress
  activationA2: FirstName & LaunchDate & ActivationProgress
  activationA3: FirstName & LaunchDate & ActivationProgress
  day21Extension: FirstName & LaunchDate
}
