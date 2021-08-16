export * from './time'
export * from './userActionEvents'
export * from './subjects'
export * from './sessionAndFeedback'

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

export const STATUS = {
  SUBMITTED: 'SUBMITTED',
  REJECTED: 'REJECTED',
  APPROVED: 'APPROVED'
}

export const PHOTO_ID_STATUS = {
  EMPTY: 'EMPTY',
  SUBMITTED: STATUS.SUBMITTED,
  REJECTED: STATUS.REJECTED,
  APPROVED: STATUS.APPROVED
}

export const REFERENCE_STATUS = {
  UNSENT: 'UNSENT',
  SENT: 'SENT',
  SUBMITTED: STATUS.SUBMITTED,
  REJECTED: STATUS.REJECTED,
  APPROVED: STATUS.APPROVED
}
