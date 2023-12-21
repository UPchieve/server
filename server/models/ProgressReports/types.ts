import { Ulid } from '../pgUtils'

export type ProgressReportStatuses =
  | 'pending'
  | 'processing'
  | 'error'
  | 'complete'

export type ProgressReportAnalysisTypes = 'single' | 'group'

export type ProgressReportFocusAreas = 'strength' | 'practiceArea'

export type ProgressReportInfoTypes = 'recommendation' | 'reason'

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
