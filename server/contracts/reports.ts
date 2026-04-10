import { ISODateString } from '../types/dates'

export type SessionReportPublic = {
  Topic: string
  Subtopic: string
  'Created at': ISODateString
  Messages: string
  'First name': string
  'Last name': string
  Email: string
  'Partner Site': string
  'Sponsor org': string
  Volunteer: string
  'Volunteer join date': ISODateString
  'Ended at': ISODateString
  'Wait time': string
  'Session rating': string
}

export type UsageReportPublic = {
  'First name': string
  'Last name': string
  Email: string
  'Minutes over date range': number
  'Total minutes': number
  'Join date': ISODateString
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
