import { Ulid } from '../pgUtils'

export type ProgressReportStatuses =
  | 'pending'
  | 'processing'
  | 'error'
  | 'complete'

export type ProgressReportAnalysisTypes = 'single' | 'group'

export type ProgressReportEvaluationTypes = 'strength' | 'practiceArea'

export type ProgressReportEvaluationDetailTypes = 'recommendation' | 'reason'

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
  reportEvaluationType: ProgressReportEvaluationTypes
  reportEvaluationDetailType: ProgressReportEvaluationDetailTypes
}

export type ProgressReportSummary = {
  id: Ulid
  summary: string
  overallGrade: number
  details: ProgressReportDetail[]
  createdAt: Date
}

export type ProgressReportTopic = {
  id: Ulid
  name: string
  description: string
  grade: number
  details: ProgressReportDetail[]
}

export type ProgressReport = {
  summary: ProgressReportSummary
  topics: ProgressReportTopic[]
}

export type ProgressReportSummaryRow = {
  id: Ulid
  summary: string
  overallGrade: number
  detailId: Ulid
  content: string
  evaluationType: string
  evaluationDetailType: string
  createdAt: Date
}

export type ProgressReportTopicRow = {
  id: Ulid
  name: string
  description: string
  grade: number
  detailId: Ulid
  content: string
  evaluationType: string
  evaluationDetailType: string
  createdAt: Date
}

export type ProgressReportSummaryInsert = Pick<
  ProgressReportSummary,
  'summary' | 'overallGrade'
>

export type ProgressReportTopicInsert = Pick<
  ProgressReportTopic,
  'name' | 'description' | 'grade'
>

export type ProgressReportDetailInsert = Pick<
  ProgressReportDetail,
  'content' | 'reportEvaluationDetailType' | 'reportEvaluationType'
>
