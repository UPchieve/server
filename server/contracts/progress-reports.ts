import type { Uuid } from '../types/shared'
import type { ISODateString } from '../types/dates'
import type {
  ProgressReportFocusAreas,
  ProgressReportInfoTypes,
  ProgressReportStatuses,
} from '../models/ProgressReports'

export type ProgressReportDetailPublic = {
  id: Uuid
  content: string
  focusArea: ProgressReportFocusAreas
  infoType: ProgressReportInfoTypes
}

export type ProgressReportSummaryPublic = {
  id: Uuid
  summary: string
  overallGrade: number
  details: ProgressReportDetailPublic[]
  createdAt: ISODateString
  reportId: Uuid
  sessionCreatedAt: ISODateString
  reportReadAt?: ISODateString
}

export type ProgressReportConceptPublic = {
  id: Uuid
  name: string
  description: string
  grade: number
  details: ProgressReportDetailPublic[]
  createdAt: ISODateString
  reportId: Uuid
  reportReadAt?: ISODateString
}

export type ProgressReportInfoPublic = {
  id: Uuid
  status: ProgressReportStatuses
  createdAt: ISODateString
  readAt?: ISODateString
}

export type ProgressReportPublic = ProgressReportInfoPublic & {
  summary: ProgressReportSummaryPublic
  concepts: ProgressReportConceptPublic[]
}

// TODO: Can this be a shared session type instead?
export type ProgressReportSessionPublic = {
  id: Uuid
  topic: string
  topicIconLink: string
  subject: string
  createdAt: ISODateString
}

export type ProgressReportOverviewSubjectStatPublic = {
  subject: string
  totalUnreadReports: number
  overallGrade: number
  latestReportCreatedAt: ISODateString
}

export type ProgressReportSessionPaginateResponse = {
  sessions: ProgressReportSessionPublic[]
  page: number
  isLastPage: boolean
}
