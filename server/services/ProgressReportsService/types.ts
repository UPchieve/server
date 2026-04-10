import { Uuid } from '../../types/shared'
import {
  ProgressReportFocusAreas,
  ProgressReportInfoTypes,
  ProgressReportAnalysisTypes,
  ProgressReportInfo,
  ProgressReportOverviewUnreadStat,
} from '../../models/ProgressReports'
import { UserSessionsFilter } from '../../models/Session'

export type ProgressReportSession = {
  reportId: Uuid
  sessionId: Uuid
  reportAnalysisType: ProgressReportAnalysisTypes
  createdAt: Date
  updatedAt: Date
}

export type ProgressReportDetail = {
  id: Uuid
  content: string
  focusArea: ProgressReportFocusAreas
  infoType: ProgressReportInfoTypes
}

export type ProgressReportSummary = {
  id: Uuid
  summary: string
  overallGrade: number
  details: ProgressReportDetail[]
  createdAt: Date
  reportId: Uuid
  sessionCreatedAt: Date
  reportReadAt?: Date
}

export type ProgressReportConcept = {
  id: Uuid
  name: string
  description: string
  grade: number
  details: ProgressReportDetail[]
  createdAt: Date
  reportId: Uuid
  reportReadAt?: Date
}

export type ProgressReport = ProgressReportInfo & {
  summary: ProgressReportSummary
  concepts: ProgressReportConcept[]
}

export type ProgressReportSessionFilter = UserSessionsFilter & {
  analysisType: ProgressReportAnalysisTypes
  subject: string
}

export type ProgressReportOverviewSubjectStat =
  ProgressReportOverviewUnreadStat & {
    overallGrade: number
    latestReportCreatedAt: Date
  }

export type ProgressReportPromptTemplateVariables = {
  responseInstructions: string
  gradeLevel?: string
  subjectDisplayName?: string
}

export type SaveProgressReportOptions = {
  userId: Uuid
  sessionIds: Uuid[]
  data: ProgressReport
  analysisType: ProgressReportAnalysisTypes
  promptId: number
}
