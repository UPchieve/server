import { getClient } from '../../db'
import { Ulid, getDbUlid } from '../../models/pgUtils'
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
} from '../../models/ProgressReports'
import { buildSessionRow, buildUserRow } from '../mocks/generate'
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
