export const CENSORED_BY = {
  regex: 'regex',
  ai: 'ai',
} as const

export type ModerationSystem = keyof typeof CENSORED_BY
