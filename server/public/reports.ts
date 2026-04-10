import {
  SessionReportPublic,
  TelecomReportPublic,
  UsageReportPublic,
} from '../contracts/reports'
import type {
  SessionReportRow,
  UsageReportRow,
} from '../models/Student/queries'
import { TelecomRow } from '../utils/reportUtils'

export function toSessionReportPublic(
  report: SessionReportRow
): SessionReportPublic {
  return {
    Topic: report.topic,
    Subtopic: report.subject,
    'Created at': report.createdAt.toISOString(),
    Messages: String(report.totalMessages),
    'First name': report.firstName,
    'Last name': report.lastName,
    Email: report.email,
    'Partner Site': report.partnerSite ?? '-',
    'Sponsor org': report.sponsorOrg ?? '-',
    Volunteer: report.volunteerJoined,
    'Volunteer join date': report.volunteerJoinedAt?.toISOString() ?? '',
    'Ended at': report.endedAt.toISOString() ?? '',
    'Wait time': report.waitTimeMins ? `${report.waitTimeMins}mins` : '',
    'Session rating': report.sessionRating ? String(report.sessionRating) : '',
  }
}

export function toUsageReportPublic(report: UsageReportRow): UsageReportPublic {
  return {
    'First name': report.firstName,
    'Last name': report.lastName,
    Email: report.email,
    'Join date': report.joinDate.toISOString(),
    'Total sessions': report.totalSessions,
    'Total minutes': report.totalSessionLengthMins,
    'Sessions over date range': report.rangeTotalSessions,
    'Minutes over date range': report.rangeSessionLengthMins,
    'High school name': report.school ?? '',
    'Partner site': report.partnerSite ?? '-',
    'HS/College': report.school ? 'High school' : 'College',
    'Sponsor Org': report.sponsorOrg ?? '-',
    'Partner Org': report.studentPartnerOrg ?? '',
  }
}

export function toTelecomReport(report: TelecomRow): TelecomReportPublic {
  return {
    name: report.name,
    email: report.email,
    eventId: report.eventId,
    date: report.date,
    hours: report.hours,
  }
}
