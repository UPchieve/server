export interface UserActionAgent {
  device: string
  browser?: string
  browserVersion?: string
  operatingSystem?: string
  operatingSystemVersion?: string
}

export type QuizzesPassedForDateRange = {
  createdAt: Date
}
