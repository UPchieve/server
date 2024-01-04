import { getClient } from '../../db'
import { Ulid, getDbUlid, getUuid } from '../../models/pgUtils'
import {
  ProgressReportDetailInsert,
  ProgressReportStatuses,
  ProgressReportConceptInsert,
  insertProgressReport,
  insertProgressReportSession,
  insertProgressReportSummary,
  insertProgressReportSummaryDetail,
  insertProgressReportConcept,
  insertProgressReportConceptDetail,
  updateProgressReportStatus,
  getProgressReportInfoBySessionId,
  getProgressReportByReportId,
  getProgressReportSummariesForMany,
  getProgressReportConceptsByReportId,
} from '../../models/ProgressReports'
import {
  ProgressReportConcept,
  ProgressReportSummary,
} from '../../services/ProgressReportsService'
import {
  buildProgressReportDetails,
  buildProgressReportSummary,
  buildProgressReportConcept,
  buildSessionRow,
  buildUserRow,
} from '../mocks/generate'
import { insertSingleRow } from '../db-utils'

const client = getClient()
let userId: Ulid
let reportId: Ulid

async function insertUser() {
  const user = buildUserRow({
    id: getDbUlid(),
    email: 'progress-reports@upchieve.org',
    referralCode: 'progress-report',
  })
  return await insertSingleRow('users', user, client)
}

async function insertSession() {
  return await insertSingleRow(
    'sessions',
    await buildSessionRow({ id: getDbUlid(), studentId: userId }),
    client
  )
}

type ProgressReportInfoRow = {
  id?: Ulid
  userId: Ulid
  statusId: number
}
async function insertProgressReportInfoRow(data: ProgressReportInfoRow) {
  return await insertSingleRow(
    'progress_reports',
    {
      id: getDbUlid(),
      ...data,
    },
    client
  )
}

type ProgressReportSessionRow = {
  sessionId: Ulid
  progressReportId: Ulid
  progressReportAnalysisTypeId: number
}
async function insertProgressReportSessionRow(data: ProgressReportSessionRow) {
  return await insertSingleRow('progress_report_sessions', data, client)
}

type ProgressReportSummaryRow = {
  id: Ulid
  summary: string
  overallGrade: number
  progressReportId: Ulid
  createdAt: Date
}

async function insertProgressReportSummaryRow(data: ProgressReportSummaryRow) {
  return await insertSingleRow('progress_report_summaries', data, client)
}

type ProgressReportConceptRow = {
  id: Ulid
  name: string
  description: string
  grade: number
  progressReportId: Ulid
  createdAt: Date
}

async function insertProgressReportConceptRow(data: ProgressReportConceptRow) {
  return await insertSingleRow('progress_report_concepts', data, client)
}

type ConceptDetailRow = {
  id: Ulid
  content: string
  progressReportConceptId: Ulid
  progressReportFocusAreaId: number
  progressReportInfoTypeId: number
}

async function insertProgressReportConceptDetailRow(data: ConceptDetailRow) {
  return await insertSingleRow('progress_report_concept_details', data, client)
}

type SummaryDetailRow = {
  id: Ulid
  content: string
  progressReportSummaryId: Ulid
  progressReportFocusAreaId: number
  progressReportInfoTypeId: number
}
async function insertProgressReportSummaryDetailRow(data: SummaryDetailRow) {
  return await insertSingleRow('progress_report_summary_details', data, client)
}

type ProgressReportInsert = {
  id: Ulid
  sessionId: Ulid
  statusId: number
  concepts: ProgressReportConcept[]
  summary: ProgressReportSummary
}
async function insertProgressReportWithSummaryAndConcepts(
  data: ProgressReportInsert
) {
  const reportId = data.id
  await insertProgressReportInfoRow({
    id: reportId,
    userId,
    statusId: data.statusId,
  })
  await insertProgressReportSessionRow({
    sessionId: data.sessionId,
    progressReportId: reportId,
    progressReportAnalysisTypeId: 1,
  })
  await insertProgressReportSummaryRow({
    id: data.summary.id,
    progressReportId: reportId,
    overallGrade: data.summary.overallGrade,
    summary: data.summary.summary,
    createdAt: data.summary.createdAt,
  })
  for (const detail of data.summary.details) {
    await insertProgressReportSummaryDetailRow({
      id: detail.id,
      progressReportFocusAreaId: 2,
      progressReportInfoTypeId: 1,
      progressReportSummaryId: data.summary.id,
      content: detail.content,
    })
  }

  for (const concept of data.concepts) {
    await insertProgressReportConceptRow({
      id: concept.id,
      name: concept.name,
      grade: concept.grade,
      description: concept.description,
      progressReportId: reportId,
      createdAt: concept.createdAt,
    })

    for (const detail of concept.details) {
      await insertProgressReportConceptDetailRow({
        id: detail.id,
        progressReportFocusAreaId: 2,
        progressReportInfoTypeId: 1,
        progressReportConceptId: concept.id,
        content: detail.content,
      })
    }
  }
}

async function getProgressReport(
  reportId: Ulid,
  status: ProgressReportStatuses
) {
  const query = `
  SELECT 
    *
  FROM progress_reports
  JOIN progress_report_statuses ON progress_reports.status_id = progress_report_statuses.id 
    WHERE progress_reports.id = $1
      AND progress_report_statuses.name = $2`
  const result = await client.query(query, [reportId, status])
  return result
}

beforeAll(async () => {
  const user = await insertUser()
  userId = user.id
})

beforeEach(async () => {
  reportId = await insertProgressReport(userId, 'pending', client)
})

describe('insertProgressReport', () => {
  test('Creates initial progress report', async () => {
    const actual = await client.query(
      'SELECT id FROM progress_reports WHERE id = $1',
      [reportId]
    )
    expect(actual.rows).toHaveLength(1)
  })

  const statuses: ProgressReportStatuses[] = [
    'pending',
    'processing',
    'error',
    'complete',
  ]
  statuses.forEach(status => {
    test(`Creates progress report with ${status} status`, async () => {
      const reportId = await insertProgressReport(userId, status, client)
      const actual = await getProgressReport(reportId, status)
      expect(actual.rows).toHaveLength(1)
    })
  })
})

describe('insertProgressReportSession', () => {
  test(`Stores a 'single' analysis properly for progress report sessions`, async () => {
    const session = await insertSession()
    const analysisType = 'single'

    await insertProgressReportSession(
      reportId,
      session.id,
      analysisType,
      client
    )

    const actual = await client.query(
      `SELECT 
        *
      FROM progress_report_sessions 
      JOIN progress_report_analysis_types 
        ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id
      WHERE 
        progress_report_id = $1 
        AND session_id = $2 
        AND progress_report_analysis_types.name = $3`,
      [reportId, session.id, analysisType]
    )
    expect(actual.rows).toHaveLength(1)
  })

  test(`Stores a 'group' analysis properly for progress report sessions`, async () => {
    const session = await insertSession()
    const analysisType = 'group'
    await insertProgressReportSession(
      reportId,
      session.id,
      analysisType,
      client
    )

    const actual = await client.query(
      `SELECT 
        *
      FROM progress_report_sessions 
      JOIN progress_report_analysis_types 
        ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id
      WHERE 
        progress_report_id = $1 
        AND session_id = $2 
        AND progress_report_analysis_types.name = $3`,
      [reportId, session.id, analysisType]
    )
    expect(actual.rows).toHaveLength(1)
  })
})

describe('insertProgressReportSummary', () => {
  test('Stores a progress report summary', async () => {
    const data = {
      summary: 'Hello, Test',
      overallGrade: 100,
    }
    await insertProgressReportSummary(reportId, data, client)

    const actual = await client.query(
      `SELECT 
        *
      FROM progress_report_summaries 
      WHERE 
        progress_report_id = $1 
        AND summary = $2 
        AND overall_grade = $3`,
      [reportId, data.summary, data.overallGrade]
    )
    expect(actual.rows).toHaveLength(1)
  })

  test('Does not create duplicate summaries for one report', async () => {
    const testDataOne = {
      summary: 'Hello, Test 1',
      overallGrade: 100,
    }
    const testDataTwo = {
      summary: 'Hello, Test 2',
      overallGrade: 50,
    }
    await insertProgressReportSummary(reportId, testDataOne, client)
    await insertProgressReportSummary(reportId, testDataTwo, client)

    const actual = await client.query(
      `SELECT 
        *
      FROM progress_report_summaries 
      WHERE 
        progress_report_id = $1 
        AND summary = $2 
        AND overall_grade = $3`,
      [reportId, testDataTwo.summary, testDataTwo.overallGrade]
    )
    expect(actual.rows).toHaveLength(1)
  })
})

describe('insertProgressReportSummaryDetail', () => {
  test(`Stores a progress report summary detail`, async () => {
    const summaryData = {
      summary: 'Hello, Test',
      overallGrade: 100,
    }
    const summaryId = await insertProgressReportSummary(
      reportId,
      summaryData,
      client
    )
    const summaryDetailData: ProgressReportDetailInsert = {
      content: 'Content',
      focusArea: 'strength',
      infoType: 'reason',
    }
    await insertProgressReportSummaryDetail(
      summaryId,
      summaryDetailData,
      client
    )

    const actual = await client.query(
      `SELECT 
        *
      FROM progress_report_summary_details
        JOIN progress_report_focus_areas 
          ON progress_report_summary_details.progress_report_focus_area_id = progress_report_focus_areas.id
        JOIN progress_report_info_types 
          ON progress_report_summary_details.progress_report_info_type_id = progress_report_info_types.id
      WHERE 
        progress_report_summary_id = $1 
        AND content = $2
        AND progress_report_focus_areas.name = $3 
        AND progress_report_info_types.name = $4`,
      [
        summaryId,
        summaryDetailData.content,
        summaryDetailData.focusArea,
        summaryDetailData.infoType,
      ]
    )
    expect(actual.rows).toHaveLength(1)
  })
})

describe('insertProgressReportConcept', () => {
  test('Stores a progress report concept', async () => {
    const data = {
      name: 'Concept',
      description: 'This concept is about Math',
      grade: 100,
    }
    await insertProgressReportConcept(reportId, data, client)
    const query = `
    SELECT 
      *
    FROM progress_report_concepts
    WHERE progress_report_id = $1
      AND name = $2
      AND description = $3
      AND grade = $4
    `

    const actual = await client.query(query, [
      reportId,
      data.name,
      data.description,
      data.grade,
    ])
    expect(actual.rows).toHaveLength(1)
  })
})

describe('insertProgressReportConceptDetail', () => {
  test('Stores a progress report concept detail', async () => {
    const conceptData: ProgressReportConceptInsert = {
      name: 'Concept',
      description: 'This concept is about Math',
      grade: 100,
    }
    const conceptId = await insertProgressReportConcept(
      reportId,
      conceptData,
      client
    )

    const conceptDetailData: ProgressReportDetailInsert = {
      content: 'Content',
      focusArea: 'practiceArea',
      infoType: 'recommendation',
    }

    await insertProgressReportConceptDetail(
      conceptId,
      conceptDetailData,
      client
    )

    const actual = await client.query(
      `SELECT 
        *
      FROM progress_report_concept_details
        JOIN progress_report_focus_areas 
          ON progress_report_concept_details.progress_report_focus_area_id = progress_report_focus_areas.id
        JOIN progress_report_info_types 
          ON progress_report_concept_details.progress_report_info_type_id = progress_report_info_types.id
      WHERE 
        progress_report_concept_id = $1 
        AND content = $2
        AND progress_report_focus_areas.name = $3 
        AND progress_report_info_types.name = $4`,
      [
        conceptId,
        conceptDetailData.content,
        conceptDetailData.focusArea,
        conceptDetailData.infoType,
      ]
    )
    expect(actual.rows).toHaveLength(1)
  })
})

describe('updateProgressReportStatus', () => {
  test('Update the status of a progress report', async () => {
    await updateProgressReportStatus(reportId, 'processing', client)
    const reportProcessing = await getProgressReport(reportId, 'processing')
    expect(reportProcessing.rows.length).toBe(1)

    await updateProgressReportStatus(reportId, 'error', client)
    const reportError = await getProgressReport(reportId, 'error')
    expect(reportError.rows.length).toBe(1)

    await updateProgressReportStatus(reportId, 'complete', client)
    const reportComplete = await getProgressReport(reportId, 'complete')
    expect(reportComplete.rows.length).toBe(1)
  })
})

describe('getProgressReportInfoBySessionId', () => {
  test('Get the progress report by the session ID', async () => {
    const reportId = getUuid()
    const session = await insertSession()
    await insertProgressReportWithSummaryAndConcepts({
      id: reportId,
      statusId: 1,
      sessionId: session.id,
      summary: buildProgressReportSummary(),
      concepts: [buildProgressReportConcept()],
    })

    const result = await getProgressReportInfoBySessionId(
      userId,
      session.id,
      'single'
    )
    expect(result).toEqual({ id: reportId, status: 'pending' })
  })
})

describe('getProgressReportByReportId', () => {
  test('Get the progress report by the report id', async () => {
    const reportId = getUuid()
    const session = await insertSession()
    await insertProgressReportWithSummaryAndConcepts({
      id: reportId,
      statusId: 1,
      sessionId: session.id,
      summary: buildProgressReportSummary(),
      concepts: [buildProgressReportConcept()],
    })

    const result = await getProgressReportByReportId(reportId)
    expect(result).toEqual({ id: reportId, status: 'pending' })
  })
})

describe('getProgressReportSummariesForMany', () => {
  test('Get multiple report summaries from multiple report ids', async () => {
    const reports: ProgressReportInsert[] = []
    for (let i = 0; i < 3; i++) {
      const session = await insertSession()
      const data = {
        id: getUuid(),
        statusId: 1,
        sessionId: session.id,
        summary: buildProgressReportSummary({
          details: [buildProgressReportDetails(), buildProgressReportDetails()],
        }),
        concepts: [buildProgressReportConcept()],
      }

      await insertProgressReportWithSummaryAndConcepts(data)
      reports.push(data)
    }

    const result = await getProgressReportSummariesForMany(
      reports.map(report => report.id)
    )

    for (const row of result) {
      const matchingSummary = reports.find(
        report => report.summary.id === row.id
      )
      if (!matchingSummary) continue
      const matchingDetail = matchingSummary.summary.details.find(
        detail => detail.id === row.detailId
      )
      if (!matchingDetail) continue

      expect(row).toEqual({
        id: matchingSummary.summary.id,
        summary: matchingSummary.summary.summary,
        overallGrade: matchingSummary.summary.overallGrade,
        createdAt: matchingSummary.summary.createdAt,
        content: matchingDetail.content,
        detailId: matchingDetail.id,
        focusArea: matchingDetail.focusArea,
        infoType: matchingDetail.infoType,
      })
    }
  })

  test('Should return an empty array when no summaries are found from a list of report ids', async () => {
    const result = await getProgressReportSummariesForMany([
      getUuid(),
      getUuid(),
    ])
    expect(result).toHaveLength(0)
  })
})

describe('getProgressReportConceptsByReportId', () => {
  test('Get concepts for a progress report', async () => {
    const session = await insertSession()
    const data = {
      id: getUuid(),
      statusId: 1,
      sessionId: session.id,
      summary: buildProgressReportSummary(),
      concepts: [
        buildProgressReportConcept({
          details: [buildProgressReportDetails(), buildProgressReportDetails()],
        }),
      ],
    }
    await insertProgressReportWithSummaryAndConcepts(data)

    const result = await getProgressReportConceptsByReportId(data.id)

    for (const row of result) {
      for (const concept of data.concepts) {
        const matchingDetail = concept.details.find(
          detail => detail.id === row.detailId
        )
        if (!matchingDetail) continue

        expect(row).toEqual({
          id: concept.id,
          name: concept.name,
          description: concept.description,
          grade: concept.grade,
          createdAt: concept.createdAt,
          content: matchingDetail.content,
          detailId: matchingDetail.id,
          focusArea: matchingDetail.focusArea,
          infoType: matchingDetail.infoType,
        })
      }
    }
  })

  test('Should return an empty array when no concepts are found from a report ID', async () => {
    const result = await getProgressReportConceptsByReportId(getUuid())
    expect(result).toHaveLength(0)
  })
})
