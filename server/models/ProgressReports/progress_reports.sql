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

