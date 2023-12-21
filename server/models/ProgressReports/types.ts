import { Ulid } from '../pgUtils'

export type ProgressReportStatuses =
  | 'pending'
  | 'processing'
  | 'error'
  | 'complete'

export type ProgressReportAnalysisTypes = 'single' | 'group'

export type ProgressFocusAreas = 'strength' | 'practiceArea'

export type ProgressInfoTypes = 'recommendation' | 'reason'

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
  focusArea: ProgressFocusAreas
  infoType: ProgressInfoTypes
}
