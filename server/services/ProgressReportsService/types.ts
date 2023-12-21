import { Ulid } from '../../models/pgUtils'
import {
  ProgressFocusAreas,
  ProgressInfoTypes,
  ProgressReportAnalysisTypes,
} from '../../models/ProgressReports'

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
  focusArea: ProgressFocusAreas
  infoType: ProgressInfoTypes
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
}

export type ProgressReport = {
  summary: ProgressReportSummary
  concepts: ProgressReportConcept[]
}
