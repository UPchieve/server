import type { Uuid } from '../../types/shared'

export type ProgressReportStatuses =
  | 'pending'
  | 'processing'
  | 'error'
  | 'complete'

export type ProgressReportAnalysisTypes = 'single' | 'group'

export type ProgressReportFocusAreas = 'strength' | 'practiceArea'

export type ProgressReportInfoTypes = 'recommendation' | 'reason'

export type ProgressReportInfo = {
  id: Uuid
  status: ProgressReportStatuses
  createdAt: Date
  readAt?: Date
}

export type ProgressReportSummaryRow = {
  id: Uuid
  summary: string
  overallGrade: number
  detailId: Uuid
  content: string
  focusArea: string
  infoType: string
  reportId: Uuid
  reportReadAt?: Date
  createdAt: Date
  sessionCreatedAt: Date
}

export type ProgressReportConceptRow = {
  id: Uuid
  name: string
  description: string
  grade: number
  detailId: Uuid
  content: string
  focusArea: string
  infoType: string
  reportId: Uuid
  reportReadAt?: Date
  createdAt: Date
}

export type ProgressReportSummaryInsert = {
  summary: string
  overallGrade: number
}

export type ProgressReportConceptInsert = {
  name: string
  description: string
  grade: number
}

export type ProgressReportDetailInsert = {
  content: string
  focusArea: ProgressReportFocusAreas
  infoType: ProgressReportInfoTypes
}

export type ProgressReportSessionPaginated = {
  id: Uuid
  topic: string
  topicIconLink: string
  subject: string
  createdAt: Date
}

export type ProgressReportOverviewUnreadStat = {
  subject: string
  totalUnreadReports: number
}

export type ProgressReportPrompt = {
  id: number
  prompt: string
}
