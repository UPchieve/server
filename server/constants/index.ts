export * from './time'
export * from './userActionEvents'
export * from './subjects'
export * from './feedbackFlags'

// uncategorized constants
export const TOTAL_VOLUNTEERS_TO_TEXT_FOR_HELP = 15

export enum ONBOARDING_STATUS {
  ONBOARDED = 'Onboarded',
  DEACTIVATED = 'Deactivated',
  INACTIVE = 'Inactive',
  IN_PROGRESS = 'In progress',
  NOT_STARTED = 'Not started'
}

export enum VERIFICATION_METHOD {
  SMS = 'sms',
  EMAIL = 'email'
}
