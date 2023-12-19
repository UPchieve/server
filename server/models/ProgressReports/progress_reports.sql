/* @name insertProgressReport */
INSERT INTO progress_reports (id, user_id, status_id)
SELECT
    :id!,
    :userId!,
    subquery.id
FROM (
    SELECT
        id
    FROM
        progress_report_statuses
    WHERE
        name = :status!) AS subquery
RETURNING
    id;


/* @name insertProgressReportSession */
INSERT INTO progress_report_sessions (progress_report_id, session_id, progress_report_analysis_type_id)
SELECT
    :reportId!,
    :sessionId!,
    subquery.id
FROM (
    SELECT
        id
    FROM
        progress_report_analysis_types
    WHERE
        name = :analysisType!) AS subquery
RETURNING
    progress_report_id AS ok;


/* @name insertProgressReportSummary */
INSERT INTO progress_report_summaries (id, progress_report_id, summary, overall_grade)
    VALUES (:id!, :reportId!, :summary!, :overallGrade!)
RETURNING
    id;


/* @name InsertProgressReportConcept */
INSERT INTO progress_report_concepts (id, name, description, grade, progress_report_id)
    VALUES (:id!, :name!, :description!, :grade!, :reportId!)
RETURNING
    id;


/* @name insertProgressReportSummaryDetail */
INSERT INTO progress_report_summary_details (id, content, progress_report_summary_id, progress_report_focus_area_id, progress_report_info_type_id)
SELECT
    :id!,
    :content!,
    :reportSummaryId!,
    (
        SELECT
            id
        FROM
            upchieve.progress_report_focus_areas
        WHERE
            name = :focusArea!), (
        SELECT
            id
        FROM
            upchieve.progress_report_info_types
        WHERE
            name = :infoType!)
RETURNING
    id;


/* @name insertProgressReportConceptDetail */
INSERT INTO progress_report_concept_details (id, content, progress_report_concept_id, progress_report_focus_area_id, progress_report_info_type_id)
SELECT
    :id!,
    :content!,
    :reportConceptId!,
    (
        SELECT
            id
        FROM
            upchieve.progress_report_focus_areas
        WHERE
            name = :focusArea!), (
        SELECT
            id
        FROM
            upchieve.progress_report_info_types
        WHERE
            name = :infoType!)
RETURNING
    id;


/* @name updateProgressReportStatus */
UPDATE
    upchieve.progress_reports
SET
    status_id = subquery.id,
    updated_at = NOW()
FROM (
    SELECT
        id
    FROM
        upchieve.progress_report_statuses
    WHERE
        name = :status!) AS subquery
WHERE
    progress_reports.id = :reportId!
RETURNING
    progress_reports.id AS ok;


/* @name getProgressReportInfoBySessionId */
SELECT
    progress_reports.id,
    progress_report_statuses.name AS status
FROM
    progress_reports
    JOIN progress_report_sessions ON progress_reports.id = progress_report_sessions.progress_report_id
    JOIN progress_report_analysis_types ON progress_report_sessions.progress_report_analysis_type_id = progress_report_analysis_types.id
    JOIN progress_report_statuses ON progress_report_statuses.id = progress_reports.status_id
    LEFT JOIN sessions ON progress_report_sessions.session_id = sessions.id
WHERE
    progress_reports.user_id = :userId!
    AND sessions.id = :sessionId!
    AND progress_report_analysis_types.name = :analysisType!
ORDER BY
    progress_reports.created_at DESC;


/* @name getProgressReportByReportId */
SELECT
    progress_reports.id,
    progress_report_statuses.name AS status
FROM
    progress_reports
    JOIN progress_report_statuses ON progress_report_statuses.id = progress_reports.status_id
WHERE
    progress_reports.id = :reportId!;


/* @name getProgressReportSummariesForMany */
SELECT
    progress_report_summaries.id,
    progress_report_summaries.summary,
    progress_report_summaries.overall_grade,
    progress_report_summary_details.id AS detail_id,
    progress_report_summary_details.content,
    progress_report_focus_areas.name AS focus_area,
    progress_report_info_types.name AS info_type,
    progress_report_summaries.created_at
FROM
    progress_report_summaries
    JOIN progress_report_summary_details ON progress_report_summaries.id = progress_report_summary_details.progress_report_summary_id
    JOIN progress_report_info_types ON progress_report_summary_details.progress_report_info_type_id = progress_report_info_types.id
    JOIN progress_report_focus_areas ON progress_report_summary_details.progress_report_focus_area_id = progress_report_focus_areas.id
WHERE
    progress_report_summaries.progress_report_id = ANY (:reportIds!)
ORDER BY
    progress_report_summaries.created_at DESC;


/* @name getProgressReportConceptsByReportId */
SELECT
    progress_report_concepts.id,
    progress_report_concepts.name,
    progress_report_concepts.description,
    progress_report_concepts.grade,
    progress_report_concept_details.id AS detail_id,
    progress_report_concept_details.content,
    progress_report_focus_areas.name AS focus_area,
    progress_report_info_types.name AS info_type,
    progress_report_concepts.created_at
FROM
    progress_report_concepts
    JOIN progress_report_concept_details ON progress_report_concepts.id = progress_report_concept_details.progress_report_concept_id
    JOIN progress_report_focus_areas ON progress_report_concept_details.progress_report_focus_area_id = progress_report_focus_areas.id
    JOIN progress_report_info_types ON progress_report_concept_details.progress_report_info_type_id = progress_report_info_types.id
WHERE
    progress_report_concepts.progress_report_id = :reportId;

