import { Ulid } from '../../models/pgUtils'
import {
  ProgressReportFocusAreas,
  ProgressReportInfoTypes,
  ProgressReportAnalysisTypes,
  ProgressReportInfo,
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
  focusArea: ProgressReportFocusAreas
  infoType: ProgressReportInfoTypes
}

export type ProgressReportSummary = {
  id: Ulid
  summary: string
  overallGrade: number
  details: ProgressReportDetail[]
  createdAt: Date
  reportId: Ulid
  reportReadAt?: Date
}

export type ProgressReportConcept = {
  id: Ulid
  name: string
  description: string
  grade: number
  details: ProgressReportDetail[]
  createdAt: Date
  reportId: Ulid
  reportReadAt?: Date
}

export type ProgressReport = ProgressReportInfo & {
  summary: ProgressReportSummary
  concepts: ProgressReportConcept[]
}
