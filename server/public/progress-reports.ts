import type {
  ProgressReportInfo,
  ProgressReportSessionPaginated,
} from '../models/ProgressReports'
import type {
  ProgressReportConceptPublic,
  ProgressReportDetailPublic,
  ProgressReportInfoPublic,
  ProgressReportOverviewSubjectStatPublic,
  ProgressReportPublic,
  ProgressReportSessionPublic,
  ProgressReportSummaryPublic,
} from '../contracts/progress-reports'
import {
  ProgressReport,
  ProgressReportConcept,
  ProgressReportDetail,
  ProgressReportOverviewSubjectStat,
  ProgressReportSummary,
} from '../services/ProgressReportsService/types'

function toProgressReportDetailPublic(
  detail: ProgressReportDetail
): ProgressReportDetailPublic {
  return {
    id: detail.id,
    content: detail.content,
    focusArea: detail.focusArea,
    infoType: detail.infoType,
  }
}

function toProgressReportInfoPublic(
  report: ProgressReportInfo
): ProgressReportInfoPublic {
  return {
    id: report.id,
    status: report.status,
    createdAt: report.createdAt.toISOString(),
    readAt: report.readAt?.toISOString(),
  }
}

export function toProgressReportSummaryPublic(
  summary: ProgressReportSummary
): ProgressReportSummaryPublic {
  return {
    id: summary.id,
    summary: summary.summary,
    overallGrade: summary.overallGrade,
    details: summary.details.map(toProgressReportDetailPublic),
    createdAt: summary.createdAt.toISOString(),
    reportId: summary.reportId,
    sessionCreatedAt: summary.sessionCreatedAt.toISOString(),
    reportReadAt: summary.reportReadAt?.toISOString(),
  }
}

export function toProgressReportConceptPublic(
  concept: ProgressReportConcept
): ProgressReportConceptPublic {
  return {
    id: concept.id,
    name: concept.name,
    description: concept.description,
    grade: concept.grade,
    details: concept.details.map(toProgressReportDetailPublic),
    createdAt: concept.createdAt.toISOString(),
    reportId: concept.reportId,
    reportReadAt: concept.reportReadAt?.toISOString(),
  }
}

export function toProgressReportPublic(
  report: ProgressReport
): ProgressReportPublic {
  return {
    ...toProgressReportInfoPublic(report),
    summary: toProgressReportSummaryPublic(report.summary),
    concepts: report.concepts.map(toProgressReportConceptPublic),
  }
}

export function toProgressReportSessionPublic(
  session: ProgressReportSessionPaginated
): ProgressReportSessionPublic {
  return {
    id: session.id,
    topic: session.topic,
    topicIconLink: session.topicIconLink,
    subject: session.subject,
    createdAt: session.createdAt.toISOString(),
  }
}

export function toProgressReportOverviewSubjectStatPublic(
  stat: ProgressReportOverviewSubjectStat
): ProgressReportOverviewSubjectStatPublic {
  return {
    subject: stat.subject,
    totalUnreadReports: stat.totalUnreadReports,
    overallGrade: stat.overallGrade,
    latestReportCreatedAt: stat.latestReportCreatedAt.toISOString(),
  }
}
