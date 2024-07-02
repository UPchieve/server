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
  getActiveSubjectPromptBySubjectName,
  deleteProgressReportsForUser,
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

async function insertUser(email?: string, referralCode?: string) {
  const user = buildUserRow({
    id: getDbUlid(),
    email: email ?? 'progress-reports@upchieve.org',
    referralCode: referralCode ?? 'progress-report',
  })
  return await insertSingleRow('users', user, client)
}

async function insertSession(data: { userId?: Ulid } = {}) {
  return await insertSingleRow(
    'sessions',
    await buildSessionRow({
      id: getDbUlid(),
      studentId: data.userId ?? userId,
    }),
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
  userId?: Ulid
}
async function insertProgressReportWithSummaryAndConcepts(
  data: ProgressReportInsert
) {
  const reportId = data.id
  await insertProgressReportInfoRow({
    id: reportId,
    userId: data.userId ?? userId,
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

type ProgressReportPromptRow = {
  id: number
  prompt: string
  subjectId: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}
async function insertProgressReportPromptRow(data: ProgressReportPromptRow) {
  return await insertSingleRow('progress_report_prompts', data, client)
}

beforeAll(async () => {
  const user = await insertUser()
  userId = user.id
})

beforeEach(async () => {
  reportId = await insertProgressReport(userId, 'pending', 1, client)
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
      const reportId = await insertProgressReport(userId, status, 1, client)
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
    expect(result).toEqual(
      expect.objectContaining({ id: reportId, status: 'pending' })
    )
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
    expect(result).toEqual(
      expect.objectContaining({ id: reportId, status: 'pending' })
    )
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

describe('getActiveSubjectPromptBySubjectName', () => {
  test('Throws an error for an empty prompt that has an active row', async () => {
    const subject = 'prealgebra'
    const data = {
      id: 1000,
      prompt: '',
      active: true,
      subjectId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await insertProgressReportPromptRow(data)

    await expect(async () => {
      await getActiveSubjectPromptBySubjectName(subject)
    }).rejects.toThrow(
      `getActivePromptBySubjectName: Empty progress report prompt for subject ${subject}`
    )
  })

  test('Throws an error for when no prompt is found for subject', async () => {
    const subject = 'fake-subject'
    await expect(async () => {
      await getActiveSubjectPromptBySubjectName(subject)
    }).rejects.toThrow(
      `getActivePromptBySubjectName: No active progress report prompt found for subject ${subject}`
    )
  })

  test('Should get the active subject prompt', async () => {
    const subject = 'algebraOne'
    const data = {
      id: 1001,
      prompt: 'Test prompt',
      active: true,
      subjectId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await insertProgressReportPromptRow(data)

    const result = await getActiveSubjectPromptBySubjectName(subject)
    expect(result.id).toEqual(data.id)
    expect(result.prompt).toEqual(data.prompt)
  })
})

describe('deleteProgressReportsForUser', () => {
  test('Deleting the progress reports for the user cascade deletes all the child rows.', async () => {
    const user = await insertUser(
      'userForDeletion@upchieve.org',
      'delete-progress-reports'
    )

    // Insert progress reports for user.
    const prSession1 = await insertSession({ userId: user.id })
    const prSummaryDetails1 = buildProgressReportDetails()
    const prSummary1 = buildProgressReportSummary({
      details: [prSummaryDetails1],
    })
    const prConcept1_1 = buildProgressReportConcept()
    const prConcept1_2 = buildProgressReportConcept()
    await insertProgressReportWithSummaryAndConcepts({
      id: getUuid(),
      userId: user.id,
      statusId: 1,
      sessionId: prSession1.id,
      summary: prSummary1,
      concepts: [prConcept1_1, prConcept1_2],
    })
    const prSession2 = await insertSession({ userId: user.id })
    const prSummary2 = buildProgressReportSummary()
    const prConceptDetails2_1 = buildProgressReportDetails()
    const prConceptDetails2_2 = buildProgressReportDetails()
    const prConcept2_1 = buildProgressReportConcept({
      details: [prConceptDetails2_1, prConceptDetails2_2],
    })
    await insertProgressReportWithSummaryAndConcepts({
      id: getUuid(),
      userId: user.id,
      statusId: 1,
      sessionId: prSession2.id,
      summary: prSummary2,
      concepts: [prConcept2_1],
    })

    // Verify before.
    // Progress Reports exists.
    const prBefore = await client.query(
      'SELECT * FROM progress_reports WHERE user_id = $1',
      [user.id]
    )
    expect(prBefore.rows.length).toBe(2)
    // Progress Report Sessions exist.
    const prSession1Before = await client.query(
      'SELECT * FROM progress_report_sessions WHERE session_id = $1',
      [prSession1.id]
    )
    expect(prSession1Before.rows.length).toBe(1)
    const prSession2Before = await client.query(
      'SELECT * FROM progress_report_sessions WHERE session_id = $1',
      [prSession2.id]
    )
    expect(prSession2Before.rows.length).toBe(1)
    // Progress Report Summaries and Details exist.
    const prSummary1Before = await client.query(
      'SELECT * FROM progress_report_summaries WHERE id = $1',
      [prSummary1.id]
    )
    expect(prSummary1Before.rows.length).toBe(1)
    const prSummaryDetails1Before = await client.query(
      'SELECT * FROM progress_report_summary_details WHERE id = $1',
      [prSummaryDetails1.id]
    )
    expect(prSummaryDetails1Before.rows.length).toBe(1)
    const prSummary2Before = await client.query(
      'SELECT * FROM progress_report_summaries WHERE id = $1',
      [prSummary2.id]
    )
    expect(prSummary2Before.rows.length).toBe(1)
    // Progress Report Concepts and Details exist.
    const prConcept1_1Before = await client.query(
      'SELECT * FROM progress_report_concepts WHERE id = $1',
      [prConcept1_1.id]
    )
    expect(prConcept1_1Before.rows.length).toBe(1)
    const prConcept1_2Before = await client.query(
      'SELECT * FROM progress_report_concepts WHERE id = $1',
      [prConcept1_2.id]
    )
    expect(prConcept1_2Before.rows.length).toBe(1)
    const prConcept2_1Before = await client.query(
      'SELECT * FROM progress_report_concepts WHERE id = $1',
      [prConcept2_1.id]
    )
    expect(prConcept2_1Before.rows.length).toBe(1)
    const prConceptDetails2_1Before = await client.query(
      'SELECT * FROM progress_report_concept_details WHERE id = $1',
      [prConceptDetails2_1.id]
    )
    expect(prConceptDetails2_1Before.rows.length).toBe(1)
    const prConceptDetails2_2Before = await client.query(
      'SELECT * FROM progress_report_concept_details WHERE id = $1',
      [prConceptDetails2_2.id]
    )
    expect(prConceptDetails2_2Before.rows.length).toBe(1)

    await deleteProgressReportsForUser(user.id)

    // Verify after.
    // Progress Reports deleted.
    const prAfter = await client.query(
      'SELECT * FROM progress_reports WHERE user_id = $1',
      [user.id]
    )
    expect(prAfter.rows.length).toBe(0)
    // Progress Report Sessions deleted.
    const prSession1After = await client.query(
      'SELECT * FROM progress_report_sessions WHERE session_id = $1',
      [prSession1.id]
    )
    expect(prSession1After.rows.length).toBe(0)
    const prSession2After = await client.query(
      'SELECT * FROM progress_report_sessions WHERE session_id = $1',
      [prSession2.id]
    )
    expect(prSession2After.rows.length).toBe(0)
    // Progress Report Summaries and Details deleted.
    const prSummary1After = await client.query(
      'SELECT * FROM progress_report_summaries WHERE id = $1',
      [prSummary1.id]
    )
    expect(prSummary1After.rows.length).toBe(0)
    const prSummaryDetails1After = await client.query(
      'SELECT * FROM progress_report_summary_details WHERE id = $1',
      [prSummaryDetails1.id]
    )
    expect(prSummaryDetails1After.rows.length).toBe(0)
    const prSummary2After = await client.query(
      'SELECT * FROM progress_report_summaries WHERE id = $1',
      [prSummary2.id]
    )
    expect(prSummary2After.rows.length).toBe(0)
    // Progress Report Concepts and Details deleted.
    const prConcept1_1After = await client.query(
      'SELECT * FROM progress_report_concepts WHERE id = $1',
      [prConcept1_1.id]
    )
    expect(prConcept1_1After.rows.length).toBe(0)
    const prConcept1_2After = await client.query(
      'SELECT * FROM progress_report_concepts WHERE id = $1',
      [prConcept1_2.id]
    )
    expect(prConcept1_2After.rows.length).toBe(0)
    const prConcept2_1After = await client.query(
      'SELECT * FROM progress_report_concepts WHERE id = $1',
      [prConcept2_1.id]
    )
    expect(prConcept2_1After.rows.length).toBe(0)
    const prConceptDetails2_1After = await client.query(
      'SELECT * FROM progress_report_concept_details WHERE id = $1',
      [prConceptDetails2_1.id]
    )
    expect(prConceptDetails2_1After.rows.length).toBe(0)
    const prConceptDetails2_2After = await client.query(
      'SELECT * FROM progress_report_concept_details WHERE id = $1',
      [prConceptDetails2_2.id]
    )
    expect(prConceptDetails2_2After.rows.length).toBe(0)
  })

  test('Deleting only deletes for the specified user', async () => {
    const user = await insertUser(
      'doNotDeletePrs@upchieve.org',
      'do-not-delete-progress-reports'
    )
    // Insert progress reports for userForDeletion.
    const prSession = await insertSession({ userId: user.id })
    const prSummaryDetails = buildProgressReportDetails()
    const prSummary = buildProgressReportSummary({
      details: [prSummaryDetails],
    })
    const prConcept1 = buildProgressReportConcept()
    const prConceptDetails1 = buildProgressReportDetails()
    const prConceptDetails2 = buildProgressReportDetails()
    const prConcept2 = buildProgressReportConcept({
      details: [prConceptDetails1, prConceptDetails2],
    })
    await insertProgressReportWithSummaryAndConcepts({
      id: getUuid(),
      userId: user.id,
      statusId: 1,
      sessionId: prSession.id,
      summary: prSummary,
      concepts: [prConcept1, prConcept2],
    })

    // Delete for some random user.
    await deleteProgressReportsForUser(getDbUlid())

    // Progress Reports deleted.
    const prAfter = await client.query(
      'SELECT * FROM progress_reports WHERE user_id = $1',
      [user.id]
    )
    expect(prAfter.rows.length).toBe(1)
    // Progress Report Sessions deleted.
    const prSessionAfter = await client.query(
      'SELECT * FROM progress_report_sessions WHERE session_id = $1',
      [prSession.id]
    )
    expect(prSessionAfter.rows.length).toBe(1)
    // Progress Report Summaries and Details deleted.
    const prSummaryAfter = await client.query(
      'SELECT * FROM progress_report_summaries WHERE id = $1',
      [prSummary.id]
    )
    expect(prSummaryAfter.rows.length).toBe(1)
    const prSummaryDetailsAfter = await client.query(
      'SELECT * FROM progress_report_summary_details WHERE id = $1',
      [prSummaryDetails.id]
    )
    expect(prSummaryDetailsAfter.rows.length).toBe(1)
    // Progress Report Concepts and Details deleted.
    const prConcept1After = await client.query(
      'SELECT * FROM progress_report_concepts WHERE id = $1',
      [prConcept1.id]
    )
    expect(prConcept1After.rows.length).toBe(1)
    const prConcept2After = await client.query(
      'SELECT * FROM progress_report_concepts WHERE id = $1',
      [prConcept2.id]
    )
    expect(prConcept2After.rows.length).toBe(1)
    const prConceptDetails1After = await client.query(
      'SELECT * FROM progress_report_concept_details WHERE id = $1',
      [prConceptDetails1.id]
    )
    expect(prConceptDetails1After.rows.length).toBe(1)
    const prConceptDetails2After = await client.query(
      'SELECT * FROM progress_report_concept_details WHERE id = $1',
      [prConceptDetails2.id]
    )
    expect(prConceptDetails2After.rows.length).toBe(1)
  })
})
