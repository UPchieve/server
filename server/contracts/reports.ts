export type SessionReportPublic = {
  Topic: string
  Subtopic: string
  'Created at': string
  Messages: string
  'First name': string
  'Last name': string
  Email: string
  'Partner site': string
  'Sponsor org': string
  Volunteer: string
  'Volunteer join date': string
  'Ended at': string
  'Wait time': string
  'Session rating': string
}

export type UsageReportPublic = {
  'First name': string
  'Last name': string
  Email: string
  'Minutes over date range': number
  'Total minutes': number
  'Join date': string
  'Total sessions': number
  'Sessions over date range': number
  'High school name': string
  'Partner site': string
  'HS/College': string
  'Sponsor Org': string
  'Partner Org': string
}

export type TelecomReportPublic = {
  name: string
  email: string
  eventId: number
  date: string
  hours: number
}

export type SessionReportResponse = {
  sessions: SessionReportPublic[]
}

export type UsageReportResponse = {
  students: UsageReportPublic[]
}
