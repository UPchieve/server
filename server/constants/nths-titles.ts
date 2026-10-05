export const NTHS_TITLES = [
  'President',
  'Vice President',
  'Executive Board Member',
  'Member',
] as const

export type NTHSTitle = (typeof NTHS_TITLES)[number]

export const LEADERSHIP_TITLES: readonly NTHSTitle[] = [
  'President',
  'Vice President',
]

export function isNthsTitle(value: unknown): value is NTHSTitle {
  return (NTHS_TITLES as readonly unknown[]).includes(value)
}
