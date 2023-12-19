import { Ulid } from '../pgUtils'

export type ProgressReportStatuses =
  | 'pending'
  | 'processing'
  | 'error'
  | 'complete'

export type ProgressReportAnalysisTypes = 'single' | 'group'

export type ProgressReportFocusAreas = 'strength' | 'practiceArea'

export type ProgressReportInfoTypes = 'recommendation' | 'reason'

export type ProgressReportSession = {
  reportId: Ulid
  sessionId: Ulid
  reportAnalysisType: ProgressReportAnalysisTypes
  createdAt: Date
  updatedAt: Date
}

export type ProgressReportDetail = {
  id: Ulid
  content: string
  focusArea: ProgressReportFocusAreas
  infoType: ProgressReportInfoTypes
}

export type ProgressReportSummary = {
  id: Ulid
  summary: string
  overallGrade: number
  details: ProgressReportDetail[]
  createdAt: Date
}

export type ProgressReportConcept = {
  id: Ulid
  name: string
  description: string
  grade: number
  details: ProgressReportDetail[]
  createdAt: Date
}

export type ProgressReport = {
  id: Ulid
  status: ProgressReportStatuses
  summary: ProgressReportSummary
  concepts: ProgressReportConcept[]
}

export type ProgressReportInfo = {
  id: Ulid
  status: ProgressReportStatuses
}

export type ProgressReportSummaryRow = {
  id: Ulid
  summary: string
  overallGrade: number
  detailId: Ulid
  content: string
  focusArea: string
  infoType: string
  createdAt: Date
}

export type ProgressReportConceptRow = {
  id: Ulid
  name: string
  description: string
  grade: number
  detailId: Ulid
  content: string
  focusArea: string
  infoType: string
  createdAt: Date
}

export type ProgressReportSummaryInsert = Pick<
  ProgressReportSummary,
  'summary' | 'overallGrade'
>

export type ProgressReportConceptInsert = Pick<
  ProgressReportConcept,
  'name' | 'description' | 'grade'
>

export type ProgressReportDetailInsert = Pick<
  ProgressReportDetail,
  'content' | 'infoType' | 'focusArea'
>
